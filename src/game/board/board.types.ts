import { PlayerData } from '../../types/game.types';

/**
 * Contract for the global telemetry header tracking match state.
 */
export interface BoardHeaderProps {
  activePlayerName: string;
  deckCount: number;
  burnCount: number;
}

/**
 * Contract for opponent viewports (focused on public deduction).
 */
export interface OpponentViewportProps {
  opponent: PlayerData;
  isCurrentTurn: boolean;
}

/**
 * Contract for the interactive client workspace at the bottom of the board.
 */
export interface ClientWorkspaceProps {
  player: PlayerData;
  isCurrentTurn: boolean;
  onPlayCard: (cardId: string) => void;
}
