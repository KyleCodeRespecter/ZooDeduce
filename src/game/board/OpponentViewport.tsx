import React from 'react';
import { OpponentViewportProps } from './board.types';
import { UserDiscardField } from '../components/UserDiscardField';
import './board.styles.css'

export const OpponentViewport: React.FC<OpponentViewportProps> = ({
  opponent,
  isCurrentTurn,
  style,
}) => {
  const { name, discardPile, isEliminated, isProtected } = opponent;
  const hasActiveStatus = isEliminated || isProtected;
  let statusText = 'Ready';
  let statusModifierClass = 'idle';
  if (isEliminated) {
    statusText = 'Eliminated';
    statusModifierClass = 'eliminated-state';
  } else if (isProtected) {
    statusText = 'Protected';
    statusModifierClass = 'protected-state';
  }

  return (
    <div
      className={`opponent-viewport ${isCurrentTurn ? 'active-turn' : ''} ${
        isEliminated ? 'eliminated' : ''
      }`}
      style={style}
    >
      <div className="opponent-meta">
        <h4 className="opponent-name">{name}</h4>

        <span
          className={`player-status ${statusModifierClass} ${hasActiveStatus ? 'active' : ''}`}
        >
          {statusText}
        </span>

        <div className="discard-title">
          <span>Discard Zone:</span>
        </div>
      </div>

      <div className="opponent-history">
        <UserDiscardField discardPile={discardPile} />
      </div>
    </div>
  );
};
