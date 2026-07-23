import { createFreshDeck, shuffleDeck, drawCard } from './deck.utils';
import { createPlayer, dealStartingHands } from './player.utils';
import { GameStateSnapshot, CardData } from '../types/game.types';

export function initializeMatch(playerNames: string[]): GameStateSnapshot {
  // 1. Generate core components
  const rawPlayers = playerNames.map((name, index) =>
    createPlayer(`player-${index + 1}`, name),
  );
  const freshDeck = createFreshDeck();
  let currentDeck = shuffleDeck(freshDeck);

  const totalBurnedCards = playerNames.length > 2 ? 1 : 4;
  const burnedCards : CardData[] = [];
  for (let i = 0; i < totalBurnedCards; i++) {
    const resultCardData = drawCard(currentDeck);
    burnedCards.push(resultCardData.drawnCard);
    currentDeck = resultCardData.remainingDeck;
  }

  // 3. Pass the data through the dealer pipeline
  const { updatedPlayers, remainingDeck } = dealStartingHands(
    rawPlayers,
    currentDeck,
  );

  // 4. Return the flawless immutable snapshot packet
  return {
    players: updatedPlayers,
    deck: remainingDeck,
    burnedCards,
    currentPlayerIndex: 0,
    winnerId: null,
  };
}
