import { PlayerData, CardData } from '../types/game.types';
import { drawCard } from './deck.utils';

/**
 * 1. PURE PLAYER GENERATION
 * Factory function that instantiates a baseline structural data packet
 * for a new player. Hands and discard piles start empty.
 */
export function createPlayer(id: string, name: string): PlayerData {
  return {
    id,
    name,
    hand: [],
    discardPile: [],
    isEliminated: false,
    isProtected: false,
  };
}

/**
 * 2. IMMUTABLE DEALT CARD TRANSFORMATION
 * Gives a card to a specific player. Instead of pushing into the player's
 * internal hand array, it returns a brand-new copy of the player struct.
 */
export function addCardToPlayerHand(
  player: PlayerData,
  card: CardData,
): PlayerData {
  return {
    ...player,
    hand: [...player.hand, card], // Returns a new array pointer with the new card attached
  };
}

/**
 * 3. ROUND INITIALIZATION DISPATCHER
 * Takes a list of players and a shuffled deck, deals 1 starting card
 * to every player, and returns the modified players array and remaining deck.
 */
export function dealStartingHands(
  players: PlayerData[],
  shuffledDeck: CardData[],
): { updatedPlayers: PlayerData[]; remainingDeck: CardData[] } {
  let currentDeck = [...shuffledDeck];

  // Map converts an array into a brand new array by running a function on every item
  const updatedPlayers = players.map((player) => {
    const { drawnCard, remainingDeck } = drawCard(currentDeck);
    currentDeck = remainingDeck; // Advance our deck tracking pointer

    return addCardToPlayerHand(player, drawnCard);
  });

  return {
    updatedPlayers,
    remainingDeck: currentDeck,
  };
}

/**
 * 4. STATE MUTER HELPER: ELIMINATION
 * Knocks a player out of the current round.
 * Automatically flushes their current hand into their discard history pile.
 */
export function eliminatePlayer(player: PlayerData): PlayerData {
  // Extract the raw card types to dump into the discard pile history
  const cardsToDiscard = player.hand.map((card) => card.type);

  return {
    ...player,
    isEliminated: true,
    hand: [], // Hand is wiped out instantly
    discardPile: [...player.discardPile, ...cardsToDiscard],
  };
}

/**
 * 5. STATE MUTER HELPER: PROTECTION (HANDMAID)
 * Applies or removes the Handmaid's protection layer flag on a player.
 */
export function setPlayerProtection(
  player: PlayerData,
  isProtected: boolean,
): PlayerData {
  return {
    ...player,
    isProtected,
  };
}
