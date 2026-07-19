import { createFreshDeck, shuffleDeck, drawCard } from './deck.utils';
import { createPlayer, dealStartingHands } from './player.utils';
import { GameStateSnapshot } from '../types/game.types';

export function initializeMatch(playerNames: string[]): GameStateSnapshot {
  // 1. Generate core components
  const rawPlayers = playerNames.map((name, index) =>
    createPlayer(`player-${index + 1}`, name),
  );
  const freshDeck = createFreshDeck();
  const shuffledDeck = shuffleDeck(freshDeck);

  // 2. Remove the hidden face-down Burn Card
  const { drawnCard: burnCard, remainingDeck: deckAfterBurn } =
    drawCard(shuffledDeck);

  // 3. Pass the data through the dealer pipeline
  const { updatedPlayers, remainingDeck } = dealStartingHands(
    rawPlayers,
    deckAfterBurn,
  );

  // 4. Return the flawless immutable snapshot packet
  return {
    players: updatedPlayers,
    deck: remainingDeck,
    burnCard,
    currentPlayerIndex: 0,
    winnerId: null,
  };
}
