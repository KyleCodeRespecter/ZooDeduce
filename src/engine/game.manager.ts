import { createFreshDeck, shuffleDeck, drawCard } from './utils/deck.utils.ts';
import { createPlayer, dealStartingHands } from './utils/player.utils.ts';
import { GameStateSnapshot, CardData, PlayerConfig, PlayerData } from '../types/game.types';

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
  explicitTargetId: string | null = null, // Provided by Human UI selection
): GameStateSnapshot {
  const nextState = JSON.parse(
    JSON.stringify(currentSnapshot),
  ) as GameStateSnapshot;
  const activePlayer = nextState.players[nextState.currentPlayerIndex];

  // 1. Locate the card index in the hand first
  const cardIndex = activePlayer.hand.findIndex((card) => card.id === cardId);

  if (cardIndex === -1) {
    console.error(
      `Player ${activePlayer.name} tried to play missing card ID: ${cardId}`,
    );
    return currentSnapshot;
  }

  const playedCard = activePlayer.hand[cardIndex];
  let finalTargetId = explicitTargetId;

  // 2. CHECK TARGETING FIRST: Exit early if a human target selection is required
  if (playedCard.requiresTarget && !finalTargetId) {
    if (activePlayer.isBot) {
      // AI Path: Auto-select target instantly
      const validTargetIds = nextState.players
        .filter((p) => p.id !== activePlayer.id && !p.isEliminated)
        .map((p) => p.id);

      finalTargetId = validTargetIds.length > 0 ? validTargetIds[0] : null;
    } else {
      // keep card in hand so it can be resolved after target selection
      const validTargetIds = nextState.players
        .filter((p) => p.id !== activePlayer.id && !p.isEliminated)
        .map((p) => p.id);

      nextState.activeTargetRequest = { cardId, validTargetIds };
      return nextState;
    }
  }

  // 3. RESOLUTION PATH: Target is verified. Safely mutate the hand data now.
  activePlayer.hand.splice(cardIndex, 1);
  activePlayer.discardPile.push(playedCard.type);

  // Clear tracking requests now that resolution has officially cleared
  nextState.activeTargetRequest = null;

  // ────────────────────────────────────────────────────────
  // TODO: APPLY CARD VALUE EFFECT RULES HERE USING finalTargetId
  // ────────────────────────────────────────────────────────

  // Advance the turn index to the next player in rotation
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

