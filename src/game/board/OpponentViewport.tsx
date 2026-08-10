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
      <div className="opponent-meta">
        <h4 className="opponent-name">{name}</h4>

        {isProtected && <span className="shield-badge">🛡️ Protected</span>}
        {isEliminated && (
          <strong className="eliminated-badge">💀 Eliminated</strong>
        )}

        <div className="card-count-indicator">
          <span>Cards in Hand:</span> <strong>{hand.length}</strong>
        </div>
      </div>

      <div className="opponent-history">
        <UserDiscardField discardPile={discardPile} />
      </div>
    </div>
  );
};
