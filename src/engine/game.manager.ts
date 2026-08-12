import { createFreshDeck, drawCard, shuffleDeck } from './utils/deck.utils.ts';
import { createPlayer, dealStartingHands, getActivePlayer } from './utils/player.utils.ts';
import {
  CardData,
  CardType,
  GameStateSnapshot,
  PlayerConfig,
  PlayerData, StagBeetleShowdown,
  TOTAL_CARD_DISTRIBUTION
} from '../types/game.types';
import { gameLogger } from '../ultils/logger/logger.ts';
import {
  auditBotMemoriesOnCardPlay,
  executeBotBeaverSelection,
  selectOptimalBotTarget
} from './bot-logic/bot.manager.ts';

/**
 * Initializes a new match snapshot, burning initial seed cards and dealing hands.
 */
export function initializeMatch(
  playerConfigs: PlayerConfig[],
): GameStateSnapshot {
  const players: PlayerData[] = playerConfigs.map((config) =>
    createPlayer(crypto.randomUUID(), config),
  );

  const freshDeck = createFreshDeck();
  let currentDeck = shuffleDeck(freshDeck);

  const totalBurnedCards = playerConfigs.length > 2 ? 1 : 4;
  const burnedCards: CardData[] = [];

  for (let i = 0; i < totalBurnedCards; i++) {
    const resultCardData = drawCard(currentDeck);
    burnedCards.push(resultCardData.drawnCard);
    currentDeck = resultCardData.remainingDeck;
  }

  const { updatedPlayers, remainingDeck } = dealStartingHands(
    players,
    currentDeck,
  );

  return {
    players: updatedPlayers,
    deck: remainingDeck,
    burnedCards,
    currentPlayerIndex: 0,
    winnerId: '',
    activeTargetRequest: null,
    targetPeekRequest: null,
    cardSelectRequest: null,
    showdown: null,
    owlNotice: null,
    botMemories: {}
  };
}

/**
 * Main transactional logic pipeline for playing cards from a player's hand.
 */
export function handleCardPlayPipeline(
  currentSnapshot: GameStateSnapshot,
  cardId: string,
  explicitTargetId: string | null = null,
  explicitGuess: CardType | null = null,
): GameStateSnapshot {
  const nextState = cloneSnapshot(currentSnapshot);
  const activePlayer = getActivePlayer(nextState);

  // Find and validate the chosen card instance
  const cardIndex = activePlayer.hand.findIndex((card) => card.id === cardId);
  if (cardIndex === -1) return currentSnapshot;
  const playedCard = activePlayer.hand[cardIndex];

  let finalTargetId = explicitTargetId;
  let finalGuess = explicitGuess;

  if (playedCard.requiresTarget && !finalTargetId) {
    const validTargetIds = filterValidTargets(
      nextState,
      activePlayer,
      playedCard,
    );

    if (validTargetIds.length === 0) {
      return executeFizzleResolution(
        nextState,
        activePlayer,
        cardIndex,
        playedCard,
      );
    }
    // condition if meerkat cannot guess anything
    if (
      playedCard.type === CardType.Meerkat &&
      isMeerkatGuessPoolExhausted(nextState)
    ) {
      return executeFizzleResolution(
        nextState,
        activePlayer,
        cardIndex,
        playedCard,
      );
    }
    // condition if there are not two cards for the beaver to draw
    if (playedCard.type === CardType.Beaver &&
      nextState.deck.length < 2
    )
    {
      return executeFizzleResolution(
        nextState,
        activePlayer,
        cardIndex,
        playedCard,
      )
    }

    // Assess if the engine can auto-bypass selection menus (1-on-1 or Bots)
    if (shouldBypassTargeting(validTargetIds, playedCard, activePlayer.isBot)) {
      if (activePlayer.isBot) {
        finalTargetId = selectOptimalBotTarget(
          nextState,
          activePlayer,
          validTargetIds,
          playedCard,
        );
        finalGuess = CardType.Owl;
      } else {
        finalTargetId = validTargetIds[0]; // Human auto-bypass selects the lone target
      }
    } else {
      nextState.activeTargetRequest = {
        cardId,
        validTargetIds,
        requiresGuess: playedCard.type === CardType.Meerkat,
      };
      return nextState;
    }
  }

  activePlayer.hand.splice(cardIndex, 1);
  activePlayer.discardPile.push(playedCard.type);
  nextState.activeTargetRequest = null;

  // Run the memory audit before executing effect rules, capturing the exact state of the board
  auditBotMemoriesOnCardPlay(nextState, activePlayer, playedCard.type);

  if (finalTargetId || !playedCard.requiresTarget) {
    executeCardEffectRules(nextState, playedCard, finalTargetId, finalGuess);
  }

  const evaluatedState = evaluateAndFinalizeMatch(nextState);
  if (evaluatedState.winnerId) return evaluatedState;

  // checking the evaluated state of the beaver card
  if (evaluatedState.cardSelectRequest !== null) {
    const currentActivePlayer = getActivePlayer(evaluatedState);

    if (currentActivePlayer.isBot) {
      const chosenCardId = executeBotBeaverSelection(evaluatedState);

      if (chosenCardId) {
        return handleCardSelectResolution(
          evaluatedState,
          chosenCardId,
        );
      }
    }
    return evaluatedState;
  }

  //checking stag beetle showdown conditional
  if (evaluatedState.showdown !== null) {
    const showdown = evaluatedState.showdown;

    const isHumanInvolved = isHumanInvolvedInShowdown(evaluatedState, showdown);

    if (!isHumanInvolved) {
      gameLogger.log(
        `[AI SHOWDOWN BYPASS]: Pure Bot-vs-Bot duel detected. Resolving instantly in background.`,
      );
      let resolvedState = handleShowdownElimination(evaluatedState);
      advanceTurnRotation(resolvedState);
      return resolvedState;
    }
    gameLogger.log(
      `[ENGINE FREEZE]: Human participant detected in showdown duel. Halting turn index loop rotations.`,
    );
    return evaluatedState;
  }

  // Handle standard peek overlays (Owl)
  if (evaluatedState.owlNotice !== null) {
    return evaluatedState;
  }

  // Handle standard peek overlays (Runs for Human Owl plays or Bot-vs-Bot peeks)
  if (evaluatedState.targetPeekRequest !== null) {
    const currentActivePlayer = getActivePlayer(evaluatedState);
    if (currentActivePlayer.isBot) {
      evaluatedState.targetPeekRequest = null;
      advanceTurnRotation(evaluatedState);
      return evaluatedState;
    }
    return evaluatedState;
  }

  // generic turn advancement. Other states should eventually end here
  advanceTurnRotation(evaluatedState);
  gameLogger.log(`human has moved turn to : ${evaluatedState.players[evaluatedState.currentPlayerIndex]}`);
  return evaluatedState;
}

/**
 * Executes turn start draw routines while handling dead loops and empty decks.
 */
export function handleStartTurn(
  currentSnapshot: GameStateSnapshot,
): GameStateSnapshot {
  const nextState = cloneSnapshot(currentSnapshot);

  // If no cards to draw we can finalize the game
  if (nextState.deck.length === 0) {
    return evaluateAndFinalizeMatch(nextState);
  }

  let activePlayer = getActivePlayer(nextState);
  let safetyCounter = 0;

  while (
    activePlayer.isEliminated &&
    safetyCounter < nextState.players.length
  ) {
    advanceTurnRotation(nextState);
    activePlayer = getActivePlayer(nextState);
    safetyCounter++;
  }

  // Resolve chameleon if needed
  activePlayer.isProtected = false;

  const cardDrawn = drawCard(nextState.deck);
  activePlayer.hand.push(cardDrawn.drawnCard);
  nextState.deck = cardDrawn.remainingDeck;

  return nextState;
}

export function handlePeekTurn(currentSnapshot: GameStateSnapshot) {
  const nextState = cloneSnapshot(currentSnapshot);

  nextState.targetPeekRequest = null;
  advanceTurnRotation(nextState);

  return handleStartTurn(nextState);
}

/**
 * Standardizes snapshot state replication
 */
function cloneSnapshot(snapshot: GameStateSnapshot): GameStateSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as GameStateSnapshot;
}

/**
 * Increments the current match index loop.
 */
function advanceTurnRotation(state: GameStateSnapshot): void {
  state.currentPlayerIndex =
    (state.currentPlayerIndex + 1) % state.players.length;
}

/**
 * Extracts valid targets based on death flags and Chameleon card protection fields.
 */
function filterValidTargets(
  state: GameStateSnapshot,
  activePlayer: PlayerData,
  playedCard: CardData,
): string[] {
  const isRhino = playedCard.type === CardType.Rhino;

  return state.players
    .filter((p) => {
      if (p.isEliminated) return false;

      // Rhino Exception: Can always target self, or target unprotected opponents
      if (isRhino) {
        return p.id === activePlayer.id || !p.isProtected;
      }

      // Standard Target Rules: Cannot target self, cannot target protected opponents
      return p.id !== activePlayer.id && !p.isProtected;
    })
    .map((p) => p.id);
}

/**
 * Determines whether a targeting phase should automatically map its own final target.
 */
function shouldBypassTargeting(
  validTargetIds: string[],
  playedCard: CardData,
  isBot: boolean,
): boolean {
  if (isBot) return true;

  const isRhino = playedCard.type === CardType.Rhino;
  const hasLoneTarget = validTargetIds.length === 1;
  const isMeerkat = playedCard.type === CardType.Meerkat;

  // Humans auto-bypass if only 1 target choice exists, unless it's a Rhino card
  // or meerkat. Meerkat will always need to guess
  return hasLoneTarget && !isRhino && !isMeerkat;
}

/**
 * Immutably discards a card if all viable targets have active protections active.
 */
function executeFizzleResolution(
  state: GameStateSnapshot,
  activePlayer: PlayerData,
  cardIndex: number,
  playedCard: CardData,
): GameStateSnapshot {
  gameLogger.log(
    `[ENGINE]: All targets protected. ${activePlayer.name}'s ${CardType[playedCard.type]} fizzled.`,
  );

  activePlayer.hand.splice(cardIndex, 1);
  activePlayer.discardPile.push(playedCard.type);
  state.activeTargetRequest = null;
  state.targetPeekRequest = null;
  advanceTurnRotation(state);

  return state;
}

/**
 * Evaluates dual end conditions to apply joint or absolute victory ids to the tree.
 */
function evaluateAndFinalizeMatch(state: GameStateSnapshot): GameStateSnapshot {
  const activePlayers = state.players.filter((p) => !p.isEliminated);

  //Condition A: Last person standing
  if (activePlayers.length === 1) {
    state.winnerId = activePlayers[0].id;
    return state;
  }

  //Condition B: Deck exhaustion tie-breaker
  if (state.deck.length === 0 && activePlayers.length > 0) {
    const playersWithMaxValues = activePlayers.map((player) => ({
      player,
      maxVal: Math.max(...player.hand.map((c) => c.type), 0),
    }));

    const highestValueOverall = Math.max(
      ...playersWithMaxValues.map((p) => p.maxVal),
    );
    const tiedWinners = playersWithMaxValues
      .filter((p) => p.maxVal === highestValueOverall)
      .map((p) => p.player);

    state.winnerId = tiedWinners.map((w) => w.id).join(',');
    return state;
  }

  return state;
}

/**
 * Activates target immunity shields for the active player.
 */
function resolveChameleonEffect(state: GameStateSnapshot): void {
  const activePlayer = getActivePlayer(state);
  activePlayer.isProtected = true;
  gameLogger.log(
    `[EFFECT]: ${activePlayer.name} deployed Chameleon protection.`,
  );
}

/**
 * Instantly knocks out the active player and flushes their hand to discard logs.
 */
function resolvePeacockEffect(state: GameStateSnapshot): void {
  const activePlayer = getActivePlayer(state);
  activePlayer.isEliminated = true;

  while (activePlayer.hand.length > 0) {
    const card = activePlayer.hand.pop();
    if (card) {
      activePlayer.discardPile.push(card.type);
    }
  }
}

/**
 * Reveals an unprotected target's card to the player.
 * Sets the context to display a card viewing overlay
 */
function resolveOwlEffect(
  state: GameStateSnapshot,
  targetId: string | null,
): void {
  if (!targetId) return;

  const activePlayer = getActivePlayer(state);
  const targetOpponent = state.players.find((p) => p.id === targetId);

  if (!targetOpponent || targetOpponent.hand.length === 0) return;

  state.targetPeekRequest = targetId;

  const isCasterBot = activePlayer.isBot;
  if (isCasterBot) {
    if (!state.botMemories[activePlayer.id]) {
      state.botMemories[activePlayer.id] = {};
    }
    state.botMemories[activePlayer.id][targetId] = targetOpponent.hand[0].type;
  }
  const isTargetHuman = isHumanPlayerId(state, targetId);

  if (isTargetHuman) {
    state.owlNotice = {
      casterId: activePlayer.id,
      victimId: targetId,
    };
  }
}

/**
 * Forces the target player to dump their hand to discards and draw a fresh replacement card.
 * Falls back to drawing from the burned cards pool if the main draw pile is completely exhausted.
 * Discarding peacock is an instant elimination.
 */
function resolveRhinoEffect(
  state: GameStateSnapshot,
  targetId: string | null,
): void {
  const targetPlayer = state.players.find((p) => p.id === targetId);

  if (!targetPlayer || targetPlayer.isEliminated) return;

  let wasPeacockDiscarded = false;
  while (targetPlayer.hand.length > 0) {
    const card = targetPlayer.hand.pop();
    if (card) {
      targetPlayer.discardPile.push(card.type);
      if (card.type === CardType.Peacock) {
        wasPeacockDiscarded = true;
      }
    }
  }

  //if peacock was removed, target is instantly eliminated
  if (wasPeacockDiscarded) {
    targetPlayer.isEliminated = true;
    return;
  }

  if (state.deck.length > 0) {
    // Pull from the main deck
    const resultCardData = drawCard(state.deck);
    targetPlayer.hand.push(resultCardData.drawnCard);
    state.deck = resultCardData.remainingDeck;
  } else if (state.burnedCards.length > 0) {
    // Draw the first card from the burned pool
    const burnedCardsCopy = [...state.burnedCards];
    const fallbackCard = burnedCardsCopy.shift();

    if (fallbackCard) {
      targetPlayer.hand.push(fallbackCard);
      state.burnedCards = burnedCardsCopy;
    }
  } else {
    //should not happen
    gameLogger.log(
      `Both main deck and burned pool are completely dry. ${targetPlayer.name} cannot draw any cards.`,
    );
  }
}

function resolveLionEffect(
  state: GameStateSnapshot,
  targetId: string | null,
): void {
  if (!targetId) return;

  const activePlayer = getActivePlayer(state);
  const targetPlayer = state.players.find((p) => p.id === targetId);

  if (
    !targetPlayer ||
    targetPlayer.isEliminated ||
    targetPlayer.hand.length === 0 ||
    activePlayer.hand.length === 0
  )
    return;

  const cardActivePlayerIsGivingAway = activePlayer.hand[0].type;
  const cardTargetPlayerIsGivingAway = targetPlayer.hand[0].type;

  const activePlayerHandCopy = [...activePlayer.hand];
  activePlayer.hand = [...targetPlayer.hand];
  targetPlayer.hand = activePlayerHandCopy;

  if (activePlayer.isBot) {
    if (!state.botMemories[activePlayer.id]) {
      state.botMemories[activePlayer.id] = {};
    }
    state.botMemories[activePlayer.id][targetId] = cardActivePlayerIsGivingAway;
  }
  if (targetPlayer.isBot) {
    if (!state.botMemories[targetPlayer.id])
      state.botMemories[targetPlayer.id] = {};
    state.botMemories[targetPlayer.id][activePlayer.id] =
      cardTargetPlayerIsGivingAway;
  }
}

function resolveMeerkatEffect(state: GameStateSnapshot, targetId: string, guess: CardType): void {
  const targetPlayer = state.players.find((p) => p.id === targetId);
  if (!targetPlayer || targetPlayer.isEliminated || !targetPlayer.hand.length) return;

  const targetHeldCardType = targetPlayer.hand[0].type;
  if (guess == targetHeldCardType) {
    targetPlayer.isEliminated = true;
    const guessedCard = targetPlayer.hand.pop();
    if (guessedCard){
      targetPlayer.discardPile.push(guessedCard.type);
    }
    }
  else {
    gameLogger.log(
      `Guess incorrect. ${targetPlayer.name} does not hold ${CardType[guess]}.`,
    );
  }

}

/**
 * Executes the Beaver draw logic, pulling up to 2 cards from the deck and bundling
 * them straight into the cardSelectRequest array alongside the player's existing card.
 */
function resolveBeaverEffect(state: GameStateSnapshot): void {
  const activePlayer = getActivePlayer(state);

  if (state.deck.length < 2) {
    return;
  }

  const selectionPool: CardData[] = [...activePlayer.hand];

  for (let i = 0; i < 2; i++) {
    const drawResult = drawCard(state.deck);
    selectionPool.push(drawResult.drawnCard);
    state.deck = drawResult.remainingDeck;
  }

  state.cardSelectRequest = selectionPool;
}

function resolveStagBeetleEffect(
  state: GameStateSnapshot,
  targetId: string,
): void {
  const challenger = getActivePlayer(state);
  const target = state.players.find((p) => p.id === targetId);

  if (
    !target ||
    target.isEliminated ||
    target.hand.length === 0 ||
    challenger.hand.length === 0
  )
    return;

  const challengerCardType = challenger.hand[0].type;
  const targetCardType = target.hand[0].type;

  let winnerId: string | null = null;
  if (challengerCardType > targetCardType) winnerId = challenger.id;
  if (targetCardType > challengerCardType) winnerId = target.id;

  state.showdown = {
    challengerId: challenger.id,
    targetId: targetId,
    challengerCard: challengerCardType,
    targetCard: targetCardType,
    winnerId: winnerId,
  };
}

function executeCardEffectRules(
  state: GameStateSnapshot,
  playedCard: CardData,
  targetId: string | null,
  guess: CardType | null,
): void {
  switch (playedCard.type) {
    case CardType.Chameleon:
      resolveChameleonEffect(state);
      break;

    case CardType.Peacock:
      resolvePeacockEffect(state);
      break;

    case CardType.Owl:
      resolveOwlEffect(state, targetId);
      break;

    case CardType.Rhino:
      resolveRhinoEffect(state, targetId);
      break;

    case CardType.Lion:
      resolveLionEffect(state, targetId);
      break;

    case CardType.Meerkat:
      if (targetId && guess !== null)
      {
        resolveMeerkatEffect(state, targetId, guess);
      }
      break;

    case CardType.Beaver:
      resolveBeaverEffect(state);
      break;

    case CardType.StagBeetle:
      if (targetId)
      {
        resolveStagBeetleEffect(state, targetId);
      }

  }
}

/**
 * Audits the public discard logs to verify if a Meerkat card has any legal options left to guess.
 * Returns true if every single non-Meerkat card instance has already been revealed face-up.
 */
function isMeerkatGuessPoolExhausted(state: GameStateSnapshot): boolean {
  const allPublicDiscards = state.players.flatMap((p) => p.discardPile);

  // Filter out the reverse-mapped text keys and exclude Meerkat itself from the options array
  const baseGuessOptions = Object.keys(CardType)
    .map((key) => Number(key))
    .filter((value) => !isNaN(value) && value !== CardType.Meerkat);

  // If even a single copy of any valid card type remains hidden, the pool is NOT exhausted
  const hasLegalGuessesRemaining = baseGuessOptions.some((typeCode) => {
    const discardCount = allPublicDiscards.filter(type => type === typeCode).length;
    const maxAllowed = TOTAL_CARD_DISTRIBUTION[typeCode as CardType];
    return discardCount < maxAllowed;
  });

  return !hasLegalGuessesRemaining;
}
/**
 * Processes the selection transaction for the Beaver card. Maps the single chosen card ID
 * into the player's hand, and returns the rejected choices back to the bottom of the deck.
 */
export function handleCardSelectResolution(
  currentSnapshot: GameStateSnapshot,
  chosenCardId: string
): GameStateSnapshot {
  const nextState = cloneSnapshot(currentSnapshot);
  const activePlayer = getActivePlayer(nextState);
  const choicesPool = nextState.cardSelectRequest;

  if (!choicesPool) {
    console.error("[ENGINE CRITICAL]: Attempted to call handleCardSelectResolution but choices array is missing.");
    return currentSnapshot;
  }

  const cardToKeep = choicesPool.find(c => c.id === chosenCardId);
  if (!cardToKeep) {
    console.error(`[ENGINE EXCEPTION]: Chosen card ID "${chosenCardId}" was not found inside the choice pool.`);
    return currentSnapshot;
  }

  activePlayer.hand = [cardToKeep];
  console.log(`[ENGINE]: ${activePlayer.name} resolved Beaver selection and retained ${CardType[cardToKeep.type]}.`);

  let shuffledDeck = shuffleDeck(choicesPool);
  shuffledDeck.forEach((card) => {
    if (card.id !== chosenCardId) {
      nextState.deck.push(card);
    }
  });

  nextState.cardSelectRequest = null;
  advanceTurnRotation(nextState);
  return nextState;
}

/**
 * Eliminates the loser of a Stag Beetle showdown and drops their card into their discard pile.
 */
export function handleShowdownElimination(state: GameStateSnapshot): GameStateSnapshot {
  const nextState = cloneSnapshot(state);
  const showdown = nextState.showdown;
  if (!showdown || !showdown.winnerId) {
    nextState.showdown = null;
    return nextState;
  }

  const loserId = showdown.challengerId === showdown.winnerId ? showdown.targetId : showdown.challengerId;
  const loser = nextState.players.find(p => p.id === loserId);

  if (loser) {
    loser.isEliminated = true;
    const deadCard = loser.hand.pop();
    if (deadCard) loser.discardPile.push(deadCard.type);
  }

  nextState.showdown = null;
  return evaluateAndFinalizeMatch(nextState);
}

/**
 * Resolves whether a specific player UUID belongs to a human user inside a given state snapshot.
 */
export function isHumanPlayerId(state: GameStateSnapshot, playerId: string): boolean {
  const player = state.players.find((p) => p.id === playerId);
  return player ? !player.isBot : false;
}

/**
 * Checks if a Stag Beetle showdown involves any living human participants.
 * Returns true if EITHER the challenger OR the target is a human.
 */
function isHumanInvolvedInShowdown(state: GameStateSnapshot, showdown: StagBeetleShowdown): boolean {
  return isHumanPlayerId(state, showdown.challengerId) || isHumanPlayerId(state, showdown.targetId);
}




