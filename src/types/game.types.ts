import './card.types.ts'
import { CardData, CardType } from './card.types.ts';
import { MatchLogEntry } from '../ultils/feed.utils.ts';


export enum GamePhase {
  MainMenu = "MAIN_MENU",
  Gameplay = "GAMEPLAY",
  GameOver = "GAME_OVER"
}

export interface PlayerData {
  id: string;
  name: string;
  hand: CardData[];
  discardPile: CardType[];
  isBot: boolean
  isEliminated: boolean;
  isProtected: boolean;
}

export interface PlayerConfig {
  name: string;
  isBot: boolean;
}

export interface TargetRequest {
  cardId: string;
  validTargetIds: string[];
  requiresGuess: boolean;
}

export interface StagBeetleShowdown{
  challengerId: string;
  targetId: string;
  challengerCard: CardType;
  targetCard: CardType;
  winnerId: string | null;
}

export interface OwlNotice {
  casterId: string;
  victimId: string;
}

export interface GameStateSnapshot {
  players: PlayerData[];
  deck: CardData[];
  burnedCards: CardData[];
  currentPlayerIndex: number;
  winnerId: string;
  activeTargetRequest: TargetRequest | null;
  targetPeekRequest: string | null;
  cardSelectRequest: CardData[] | null;
  showdown: StagBeetleShowdown | null;
  owlNotice: OwlNotice | null;
  botMemories: Record<string, Record<string, CardType>>;
  actionFeed: MatchLogEntry[];
}

export const TOTAL_CARD_DISTRIBUTION: Record<CardType, number> = {
  [CardType.Peacock]: 1,
  [CardType.Tiger]: 1,
  [CardType.Lion]: 1,
  [CardType.Beaver]: 2,
  [CardType.Rhino]: 2,
  [CardType.Chameleon]: 2,
  [CardType.StagBeetle]: 2,
  [CardType.Owl]: 2,
  [CardType.Meerkat]: 6,
} as const;

