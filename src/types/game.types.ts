export enum CardType {
  Peacock = 9,
  Tiger = 8,
  Lion = 7,
  Beaver = 6,
  Rhino = 5,
  Chameleon = 4,
  StagBeetle = 3,
  Owl = 2,
  Meerkat = 1,
}

export enum GamePhase {
  MainMenu = "MAIN_MENU",
  Gameplay = "GAMEPLAY",
  GameOver = "GAME_OVER"
}


export interface CardData {
  id: string; // Unique instance ID generated via crypto.randomUUID()
  type: CardType;
}

/**
 * Struct-like representation of a player's runtime entity state.
 */
export interface PlayerData {
  id: string;           // Unique player slot identifier (e.g., 'player-1')
  name: string;         // Display name
  hand: CardData[];     // Current active cards (max 2 during a turn)
  discardPile: CardType[]; // History of cards played/discarded this round
  isEliminated: boolean;// True if knocked out of the current round
  isProtected: boolean; // True if Handmaid effect is active
}

/**
 * The total snapshot of a match state at any single tick.
 * This is the master object your engine will mutate and your UI will render.
 */
export interface GameStateSnapshot {
  players: PlayerData[];
  deck: CardData[];
  burnedCards: CardData[] | null; // The hidden card removed at start of round
  currentPlayerIndex: number; // Index pointer to active player in players array
  winnerId: string | null; // Tracks who won the current round
}

export const CARD_RULES_REGISTRY: Record<CardType, { title: string; description: string }> = {
[CardType.Peacock]: {
  title: "Peacock",
    description: "The crown jewel of the zoo. If you discard this card, you are out."
},
[CardType.Tiger]: {
  title: "Tiger",
    description: "If you have this card and the Lion or Rhino in your hand, the territory has become too crowded. You must discard this card."
},
[CardType.Lion]: {
  title: "Lion",
    description: "The King of the Jungle demands a trade. Trade hands with another player of your choice."
},
[CardType.Rhino]: {
  title: "Rhino",
    description: "The rhino charges another player. Choose any player to discard their hand and draw a new card."
},
[CardType.Chameleon]: {
  title: "Chameleon",
    description: "The chameleon hides itself. Until your next turn, ignore all effects from other players' cards."
},
[CardType.StagBeetle]: {
  title: "Stag Beetle",
    description: "The stag beetle challenges for dominance. Secretly compare hands with another player. Lowest value is out."
},
[CardType.Beaver]: {
  title: "Beaver",
    description: "The beaver constructs a fortress. Draw 2 cards. Keep 1, place the other 2 on the bottom of the deck."
},
[CardType.Owl]: {
  title: "Owl",
    description: "The owl sees what others cannot. Look at another player's hand."
},
[CardType.Meerkat]: {
  title: "Meerkat",
    description: "The meerkat senses danger. Guess a player's hand. If correct (excluding Meerkat), they are out."
}
};

