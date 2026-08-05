import { createFreshDeck, shuffleDeck, drawCard } from './deck.utils';
import { createPlayer, dealStartingHands } from './player.utils';
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
  };
}

export function handleCardPlayPipeline(
  currentSnapshot: GameStateSnapshot,
  cardId: string,
): GameStateSnapshot {
  // 1. Create a deep copy to keep state mutations pure and immutable
  const nextState = JSON.parse(
    JSON.stringify(currentSnapshot),
  ) as GameStateSnapshot;

  // 2. Identify the active player
  const activePlayer = nextState.players[nextState.currentPlayerIndex];

  // 3. Find the index of the clicked card in their hand
  const cardIndex = activePlayer.hand.findIndex((card) => card.id === cardId);

  // Guard check: ensure the card actually exists in their hand
  if (cardIndex === -1) {
    console.error(
      `Player ${activePlayer.name} tried to play missing card ID: ${cardId}`,
    );
    return currentSnapshot; // Return unchanged state safely
  }

  // 4. Splice (remove) the card from the hand array
  const [playedCard] = activePlayer.hand.splice(cardIndex, 1);

  // 5. Push the type of the card into the player's discard pile history
  activePlayer.discardPile.push(playedCard.type);

  // 6. Advance the turn index to the next player in rotation
  nextState.currentPlayerIndex =
    (nextState.currentPlayerIndex + 1) % nextState.players.length;

  return nextState;
}

export function handleStartTurn(
  currentSnapshot: GameStateSnapshot,
): GameStateSnapshot {
  const nextState = JSON.parse(
    JSON.stringify(currentSnapshot),
  ) as GameStateSnapshot;
  const activePlayer = nextState.players[nextState.currentPlayerIndex];
  const cardDrawn = drawCard(nextState.deck);
  activePlayer.hand.push(cardDrawn.drawnCard);
  nextState.deck = cardDrawn.remainingDeck;
  return nextState;
}
