import { PlayerData } from './game.types.ts';

export interface UserFieldProps {
  player: PlayerData;
  isMyTurn: boolean;
  onCardPlayed: (cardId: string) => void;
}
