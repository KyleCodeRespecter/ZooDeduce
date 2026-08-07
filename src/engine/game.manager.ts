import { createFreshDeck, shuffleDeck, drawCard } from './utils/deck.utils.ts';
import { createPlayer, dealStartingHands } from './utils/player.utils.ts';
import { GameStateSnapshot, CardData, PlayerConfig, PlayerData, CardType } from '../types/game.types';

export function initializeMatch(playerConfigs: PlayerConfig[]): GameStateSnapshot {
  // 1. Generate core components
  const players: PlayerData[] = playerConfigs.map((config) =>
    createPlayer(crypto.randomUUID(), config),
  );
  const freshDeck = createFreshDeck();
  let currentDeck = shuffleDeck(freshDeck);

  const totalBurnedCards = playerConfigs.length > 2 ? 1 : 4;
  const burnedCards : CardData[] = [];
  for (let i = 0; i < totalBurnedCards; i++) {
    const resultCardData = drawCard(currentDeck);
    burnedCards.push(resultCardData.drawnCard);
    currentDeck = resultCardData.remainingDeck;
  }

  // 3. Pass the data through the dealer pipeline
  const { updatedPlayers, remainingDeck } = dealStartingHands(
    players,
    currentDeck,
  );

  // 4. Return the flawless immutable snapshot packet
  return {
    players: updatedPlayers,
    deck: remainingDeck,
    burnedCards,
    currentPlayerIndex: 0,
    winnerId: '',
    activeTargetRequest: null
  };
}

export function handleCardPlayPipeline(
  currentSnapshot: GameStateSnapshot,
  cardId: string,
  explicitTargetId: string | null = null,
): GameStateSnapshot {
  const nextState = JSON.parse(
    JSON.stringify(currentSnapshot),
  ) as GameStateSnapshot;
  const activePlayer = nextState.players[nextState.currentPlayerIndex];

  const cardIndex = activePlayer.hand.findIndex((card) => card.id === cardId);
  if (cardIndex === -1) return currentSnapshot;

  const playedCard = activePlayer.hand[cardIndex];
  let finalTargetId = explicitTargetId;

  if (playedCard.requiresTarget && !finalTargetId) {
    // 1. Check if this specific card allows self-targeting (e.g., Rhino is CardType 4)
    const allowsSelfTarget = playedCard.type === CardType.Rhino;

    // 2. Generate valid targets based on that rule exception
    const validTargetIds = nextState.players
      .filter((p) => {
        if (p.isEliminated) return false;
        // If it allows self-target, keep the active player. Otherwise, filter them out.
        return allowsSelfTarget ? true : p.id !== activePlayer.id;
      })
      .map((p) => p.id);

    if (activePlayer.isBot) {
      // AI Path: Choose a valid target instantly
      finalTargetId = validTargetIds.length > 0 ? validTargetIds[0] : null;
    } else {
      // Human Path: Pass the custom list down to your existing UI Overlay
      nextState.activeTargetRequest = { cardId, validTargetIds };
      return nextState;
    }
  }

  // 3. RESOLUTION PATH
  activePlayer.hand.splice(cardIndex, 1);
  activePlayer.discardPile.push(playedCard.type);
  nextState.activeTargetRequest = null;

  // ────────────────────────────────────────────────────────
  // TODO: APPLY CARD VALUE EFFECT RULES HERE USING finalTargetId
  // ────────────────────────────────────────────────────────

  nextState.currentPlayerIndex =
    (nextState.currentPlayerIndex + 1) % nextState.players.length;

  return nextState;
}



export function handleStartTurn(
  currentSnapshot: GameStateSnapshot,
): GameStateSnapshot {
  let nextState = JSON.parse(JSON.stringify(currentSnapshot)) as GameStateSnapshot;

  if (nextState.deck.length === 0) {
    return evaluateAndFinalizeMatch(nextState);
  }

  let activePlayer = nextState.players[nextState.currentPlayerIndex];

  let safetyCounter = 0;
  while (activePlayer.isEliminated && safetyCounter < nextState.players.length) {
    nextState.currentPlayerIndex = (nextState.currentPlayerIndex + 1) % nextState.players.length;
    activePlayer = nextState.players[nextState.currentPlayerIndex];
    safetyCounter++;
  }


  const cardDrawn = drawCard(nextState.deck);
  activePlayer.hand.push(cardDrawn.drawnCard);
  nextState.deck = cardDrawn.remainingDeck;

  return nextState;
}

function evaluateAndFinalizeMatch(
  currentSnapshot: GameStateSnapshot,
): GameStateSnapshot {
  const nextState = JSON.parse(
    JSON.stringify(currentSnapshot),
  ) as GameStateSnapshot;
  const activePlayers = nextState.players.filter((p) => !p.isEliminated);

  // Rule A: Last person standing
  if (activePlayers.length === 1) {
    nextState.winnerId = activePlayers[0].id;
    return nextState;
  }

  // Rule B: Deck exhaustion tie-breaker with joint-winner support
  const totalCardsLeftToDraw = nextState.deck?.length ?? 0;
  if (totalCardsLeftToDraw === 0 && activePlayers.length > 0) {
    // Step 1: Map each player to their highest card value
    const playersWithMaxValues = activePlayers.map((player) => ({
      player,
      maxVal: Math.max(...player.hand.map((c) => c.type), 0),
    }));

    // Step 2: Find the absolute highest value present across the table
    const highestValueOverall = Math.max(
      ...playersWithMaxValues.map((p) => p.maxVal),
    );

    // Step 3: Filter for all players who share this top score
    const tiedWinners = playersWithMaxValues
      .filter((p) => p.maxVal === highestValueOverall)
      .map((p) => p.player);

    // Step 4: Join IDs together to support your string type field
    nextState.winnerId = tiedWinners.map((w) => w.id).join(',');
    return nextState;
  }

  return nextState;
}

