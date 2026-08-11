import { CardData, CardType , TOTAL_CARD_DISTRIBUTION} from '../../types/game.types.ts';

export function createFreshDeck(): CardData[] {

  const NON_TARGET_REQUIRED_CARDS = [
    CardType.Chameleon,
    CardType.Beaver,
    CardType.Tiger,
    CardType.Peacock,
  ];
  // Map out the quantity distribution rules for a standard deck
  const deckDistribution: Record<CardType, number> = TOTAL_CARD_DISTRIBUTION;

  const deck: CardData[] = [];

  // Loop through our distribution rule to spawn the physical entity objects
  // Note: Object.entries turns enums into string/number arrays we can loop over
  Object.entries(deckDistribution).forEach(([typeString, quantity]) => {
    const cardType = Number(typeString) as CardType;
    const isTargetedCard = !NON_TARGET_REQUIRED_CARDS.includes(cardType);
    for (let i = 0; i < quantity; i++) {
      deck.push({
        id: crypto.randomUUID(),
        type: cardType,
        requiresTarget: isTargetedCard,
      });
    }
  });

  return deck;
}

/**
 * Takes a deck array, performs a random Fischer-Yates shuffle,
 * and returns a new array without touching the original input.
 */
export function shuffleDeck(originalDeck: CardData[]): CardData[] {
  const shuffled = [...originalDeck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled;
}

/**
 * Simulates dealing a card from the deck.
 * It returns an object containing the drawn card and the remaining deck.
 */
export function drawCard(currentDeck: CardData[]): {
  drawnCard: CardData;
  remainingDeck: CardData[];
} {
  if (currentDeck.length === 0) {
    throw new Error('Cannot draw from an empty deck!');
  }

  // Create a copy of the deck array excluding the first element
  const remainingDeck = currentDeck.slice(1);
  const drawnCard = currentDeck[0];

  return { drawnCard, remainingDeck };
}
