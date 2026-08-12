import { PlayerData, CardData, PlayerConfig, CardType, GameStateSnapshot } from '../../types/game.types.ts';
import { drawCard } from './deck.utils.ts';

/**
 * Factory function that instantiates a baseline structural data packet
 * for a new player. Hands and discard piles start empty.
 */
export function createPlayer(id: string, config: PlayerConfig): PlayerData {
  return {
    id,
    name: config.name,
    isBot:config.isBot,
    hand: [],
    discardPile: [],
    isEliminated: false,
    isProtected: false,
  };
}

/**
 * Standardizes lookups for whichever player currently holds active execution focus.
 */
export function getActivePlayer(state: GameStateSnapshot): PlayerData {
  return state.players[state.currentPlayerIndex];
}

/**
 * Gives a card to a specific player.
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

export function isTigerCardPlayMandatory(playerHand: CardData[]): boolean {
  if (!playerHand || playerHand.length < 2) return false;

  const hasTiger = playerHand.some((card) => card.type === CardType.Tiger);
  const hasConditionalCard = playerHand.some(
    (card) => card.type === CardType.Rhino || card.type === CardType.Lion,
  );

  return hasTiger && hasConditionalCard;
}
