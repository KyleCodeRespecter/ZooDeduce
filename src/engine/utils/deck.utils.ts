import { CardData, CardType } from '../../types/game.types.ts';

export function createFreshDeck(): CardData[] {

  const NON_TARGET_REQUIRED_CARDS = [
    CardType.Chameleon,
    CardType.Beaver,
    CardType.Tiger,
    CardType.Peacock,
  ];
  // Map out the quantity distribution rules for a standard deck
  const deckDistribution: Record<CardType, number> = {
    [CardType.Peacock]: 1,
    [CardType.Tiger]: 1,
    [CardType.Lion]: 1,
    [CardType.Beaver]: 2,
    [CardType.Rhino]: 2,
    [CardType.Chameleon]: 2,
    [CardType.StagBeetle]: 2,
    [CardType.Owl]: 2,
    [CardType.Meerkat]: 6,
  };

  const deck: CardData[] = [];

  // Loop through our distribution rule to spawn the physical entity objects
  // Note: Object.entries turns enums into string/number arrays we can loop over
  Object.entries(deckDistribution).forEach(([typeString, quantity]) => {
    const cardType = Number(typeString) as CardType;
    const targetedCard = !NON_TARGET_REQUIRED_CARDS.includes(cardType);
    for (let i = 0; i < quantity; i++) {
      deck.push({
        id: crypto.randomUUID(), // Each card gets a flawless unique identifier
        type: cardType,
        requiresTarget: targetedCard,
      });
    }
  });

  return deck;
}

/**
 * 2. IMMUTABLE SHUFFLE FUNCTION
 * Takes a deck array, performs a random Fischer-Yates shuffle,
 * and returns a BRAND NEW array without touching the original input.
 */
export function shuffleDeck(originalDeck: CardData[]): CardData[] {
  // In functional programming, we NEVER mutate inputs directly.
  // The '...' syntax creates a shallow copy of the array pointer elements.
  const shuffled = [...originalDeck];

  // Standard Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled; // Return the new array tree
}

/**
 * 3. IMMUTABLE DEAL FUNCTION
 * Simulates dealing a card from the deck.
 * It returns an object containing the drawn card AND the remaining deck.
 */
export function drawCard(currentDeck: CardData[]): {
  drawnCard: CardData;
  remainingDeck: CardData[];
} {
  if (currentDeck.length === 0) {
    throw new Error('Cannot draw from an empty deck!');
  }

  // Create a copy of the deck array excluding the first element (index 0)
  const remainingDeck = currentDeck.slice(1);
  const drawnCard = currentDeck[0];

  // Return both data points packed together
  return { drawnCard, remainingDeck };
}
