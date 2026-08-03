import React from 'react';
import { BoardHeaderProps } from './board.types';

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  activePlayerName,
  deckCount,
  burnCount,
}) => {
  return (
    <header className="board-header">
      <div className="active-turn-indicator">
        <span className="label">Current Turn:</span>{' '}
        <strong className="player-name">{activePlayerName}</strong>
      </div>

      <div className="deck-telemetry">
        <span className="telemetry-item">
          Deck: <strong>{deckCount}</strong>
        </span>
        <span className="telemetry-divider">|</span>
        <span className="telemetry-item">
          Burned: <strong>{burnCount}</strong>
        </span>
      </div>
    </header>
  );
};
