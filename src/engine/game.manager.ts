// src/engine/game.manager.ts
import { createFreshDeck, shuffleDeck, drawCard } from './utils/deck.utils.ts';
import { createPlayer, dealStartingHands } from './utils/player.utils.ts';
import {
  GameStateSnapshot,
  CardData,
  PlayerConfig,
  PlayerData,
  CardType,
} from '../types/game.types';

/* ==========================================================================
   PUBLIC
   ========================================================================== */

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

  // Determine burn count based on lobby size constraints
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
  // Pull out recurring clone boilerplate using our private core utility
  const nextState = cloneSnapshot(currentSnapshot);
  const activePlayer = getActivePlayer(nextState);

  // Find and validate the chosen card instance
  const cardIndex = activePlayer.hand.findIndex((card) => card.id === cardId);
  if (cardIndex === -1) return currentSnapshot;
  const playedCard = activePlayer.hand[cardIndex];

  let finalTargetId = explicitTargetId;

  // 1. Targeting Gateway Validation
  if (playedCard.requiresTarget && !finalTargetId) {
    const validTargetIds = filterValidTargets(
      nextState,
      activePlayer,
      playedCard,
    );

    // Rule A: Automatically resolve card as a fizzle if all opponents are protected
    if (validTargetIds.length === 0) {
      return executeFizzleResolution(
        nextState,
        activePlayer,
        cardIndex,
        playedCard,
      );
    }

    // Rule B: Assess if the engine can auto-bypass selection menus (1-on-1 or Bots)
    if (shouldBypassTargeting(validTargetIds, playedCard, activePlayer.isBot)) {
      finalTargetId = validTargetIds[0];
    } else {
      // Human path: Block step progress and yield control back to the UI Target Selection Modal
      nextState.activeTargetRequest = { cardId, validTargetIds };
      return nextState;
    }
  }

  // 2. Action Resolution Path (Splicing from hand into the discard matrix)
  activePlayer.hand.splice(cardIndex, 1);
  activePlayer.discardPile.push(playedCard.type);
  nextState.activeTargetRequest = null;

  // Execute rules engine logic behaviors if targeting parameters match up cleanly
  // if (finalTargetId || !playedCard.requiresTarget) {
  //   executeCardEffectRules(nextState, playedCard, finalTargetId);
  // }

  // Advance turn loop index using our private shifter utility
  advanceTurnRotation(nextState);

  return nextState;
}

/**
 * Executes turn start draw routines while handling dead loops and empty decks.
 */
export function handleStartTurn(
  currentSnapshot: GameStateSnapshot,
): GameStateSnapshot {
  const nextState = cloneSnapshot(currentSnapshot);

  // Intercept immediately if the card draw pool runs dry at the start of a turn
  if (nextState.deck.length === 0) {
    return evaluateAndFinalizeMatch(nextState);
  }

  // Auto-skip eliminated players down the line using loop indexing
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

  // Safely execute turn-start card acquisition
  const cardDrawn = drawCard(nextState.deck);
  activePlayer.hand.push(cardDrawn.drawnCard);
  nextState.deck = cardDrawn.remainingDeck;

  return nextState;
}

/* ==========================================================================
   PRIVATE
   ========================================================================== */

/**
 * Standardizes snapshot state replication, reducing deep copy memory allocation boilerplate.
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
 * Increments the current match index loop, auto-cycling cleanly back to 0.
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

  // Humans auto-bypass if only 1 target choice exists, unless it's a versatile self/target Rhino
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
  console.log(
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

  // Victory Condition A: Last Player Standing
  if (activePlayers.length === 1) {
    state.winnerId = activePlayers[0].id;
    return state;
  }

  // Victory Condition B: Deck Exhaustion Showdown (High Card Value Winner)
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
 * Router utility to fire algorithmic data calculations per card value type.
 */
// function executeCardEffectRules(
//   state: GameStateSnapshot,
//   playedCard: CardData,
//   targetId: string | null,
// ): void {
//   // ──────────────────────────────────────────────────────────────────────
//   // TODO: CORE CARD RESOLUTIONS ACCELERATION IN THE NEXT STEP
//   // ──────────────────────────────────────────────────────────────────────
//   switch (playedCard.type) {
//     case CardType.Beaver:
//       // resolveBeaverMechanic(state);
//       break;
//     case CardType.Owl:
//       // resolveOwlMechanic(state, targetId);
//       break;
//   }
// }
