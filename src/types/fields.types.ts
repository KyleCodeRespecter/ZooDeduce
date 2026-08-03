import { CardType, PlayerData } from './game.types.ts';

export interface UserFieldProps {
  player: PlayerData;
  isMyTurn: boolean;
  onCardPlayed: (cardId: string) => void;
}

export interface UserDiscardFieldProps {
  discardPile: CardType[];
  title?: string;
}
