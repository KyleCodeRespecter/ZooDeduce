import { createFreshDeck, shuffleDeck, drawCard } from './utils/deck.utils.ts';
import { createPlayer, dealStartingHands } from './utils/player.utils.ts';
import {
  GameStateSnapshot,
  CardData,
  PlayerConfig,
  PlayerData,
  CardType,
} from '../types/game.types';
import { gameLogger } from '../ultils/logger/logger.ts';
import { selectOptimalBotTarget } from './bot-logic/bot.manager.ts';

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
    targetPeekRequest: null
  };
}

/**
 * Main transactional logic pipeline for playing cards from a player's hand.
 */
export function handleCardPlayPipeline(
  currentSnapshot: GameStateSnapshot,
  cardId: string,
  explicitTargetId: string | null = null,
): GameStateSnapshot {
  const nextState = cloneSnapshot(currentSnapshot);
  const activePlayer = getActivePlayer(nextState);

  // Find and validate the chosen card instance
  const cardIndex = activePlayer.hand.findIndex((card) => card.id === cardId);
  if (cardIndex === -1) return currentSnapshot;
  const playedCard = activePlayer.hand[cardIndex];

  let finalTargetId = explicitTargetId;

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

    // Assess if the engine can auto-bypass selection menus (1-on-1 or Bots)
    if (shouldBypassTargeting(validTargetIds, playedCard, activePlayer.isBot)) {
      if (activePlayer.isBot) {
        finalTargetId = selectOptimalBotTarget(
          nextState,
          activePlayer,
          validTargetIds,
          playedCard,
        );
      } else {
        finalTargetId = validTargetIds[0]; // Human auto-bypass selects the lone target
      }
    } else {
      nextState.activeTargetRequest = { cardId, validTargetIds };
      return nextState;
    }
  }

  activePlayer.hand.splice(cardIndex, 1);
  activePlayer.discardPile.push(playedCard.type);
  nextState.activeTargetRequest = null;

  if (finalTargetId || !playedCard.requiresTarget) {
    executeCardEffectRules(nextState, playedCard, finalTargetId);
  }

  const evaluatedState = evaluateAndFinalizeMatch(nextState);
  if (evaluatedState.winnerId) {
    return evaluatedState; // Do not advance turns if the game is over.
  }

  //this request signals an overlay if the player who initiated was human
  if (evaluatedState.targetPeekRequest !== null) {
    const currentActivePlayer = getActivePlayer(evaluatedState);

    if (currentActivePlayer.isBot) {
      return handlePeekTurn(evaluatedState);
    }
    return evaluatedState;
  }

  advanceTurnRotation(evaluatedState);

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
  nextState.currentPlayerIndex = (nextState.currentPlayerIndex + 1) % nextState.players.length;

  return handleStartTurn(nextState);
}

/**
 * Standardizes snapshot state replication
 */
function cloneSnapshot(snapshot: GameStateSnapshot): GameStateSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as GameStateSnapshot;
}

/**
 * Standardizes lookups for whichever player currently holds active execution focus.
 */
function getActivePlayer(state: GameStateSnapshot): PlayerData {
  return state.players[state.currentPlayerIndex];
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

  // Humans auto-bypass if only 1 target choice exists, unless it's a Rhino card
  return hasLoneTarget && !isRhino;
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
  gameLogger.log(`[EFFECT]: ${activePlayer.name} deployed Chameleon protection.`);
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
  gameLogger.log(
    `[EFFECT]: ${activePlayer.name} was forced to trigger Peacock suicide elimination.`,
  );
}

/**
 * Reveals an unprotected target's card parameters to the player.
 */
function resolveOwlEffect(state: GameStateSnapshot, targetId: string | null): void {
  if (!targetId) return;

  const activePlayer = getActivePlayer(state);
  const targetOpponent = state.players.find(p => p.id === targetId);

  if (targetOpponent) {
    gameLogger.log(
      `[EFFECT]: ${activePlayer.name} utilized Owl to peek at ${targetOpponent.name}.`,
    );
    state.targetPeekRequest = targetId;
  }
}

/**
 * Forces a target choice execution route to discard their active card layout.
 */
function resolveRhinoEffect(state: GameStateSnapshot, targetId: string | null): void {
  if (!targetId) return;

  const activePlayer = getActivePlayer(state);
  const targetPlayer = state.players.find(p => p.id === targetId);

  if (targetPlayer) {
    console.log(`[EFFECT]: ${activePlayer.name} targeted ${targetPlayer.name} with Rhino.`);
    // Future Note: Implement specific discard/draw replacement mechanics here
  }
}


function executeCardEffectRules(
  state: GameStateSnapshot,
  playedCard: CardData,
  targetId: string | null
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
  }
}

