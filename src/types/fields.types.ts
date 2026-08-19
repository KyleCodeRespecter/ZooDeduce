import { CardType } from './card.types.ts';
import { PlayerData } from './game.types.ts';

export interface UserFieldProps {
  player: PlayerData;
  isMyTurn: boolean;
  onCardPlayed: (cardId: string) => void;
}

export interface UserDiscardFieldProps {
  discardPile: CardType[];
  title?: string;
}
