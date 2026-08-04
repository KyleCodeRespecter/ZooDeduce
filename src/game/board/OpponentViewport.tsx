// src/components/game/board/OpponentViewport.tsx

import React from 'react';
import { OpponentViewportProps } from './board.types';
import { UserDiscardField } from '../components/UserDiscardField';
import './board.styles.css'

export const OpponentViewport: React.FC<OpponentViewportProps> = ({
  opponent,
  isCurrentTurn,
}) => {
  const { name, hand, discardPile, isEliminated, isProtected } = opponent;

  return (
    <div
      className={`opponent-viewport ${isCurrentTurn ? 'active-turn' : ''} ${
        isEliminated ? 'eliminated' : ''
      }`}
    >
      {/* Header / Metadata Area */}
      <div className="opponent-meta">
        <h4 className="opponent-name">{name}</h4>

        {/* Status Badges: Strong importance applied to critical game-state alerts */}
        {isProtected && <span className="shield-badge">🛡️ Protected</span>}
        {isEliminated && (
          <strong className="eliminated-badge">💀 Eliminated</strong>
        )}

        {/* Card Count Indicator */}
        <div className="card-count-indicator">
          <span>Cards in Hand:</span> <strong>{hand.length}</strong>
        </div>
      </div>

      {/* Deductive Core: Public Discard History */}
      <div className="opponent-history">
        <UserDiscardField discardPile={discardPile} />
      </div>
    </div>
  );
};
