// src/components/game/board/ClientWorkspace.tsx
import React from 'react';
import { ClientWorkspaceProps } from './board.types';
import { UserField } from '../components/UserField.tsx';
import { UserDiscardField } from '../components/UserDiscardField.tsx';

export const ClientWorkspace: React.FC<ClientWorkspaceProps> = ({
  player,
  isCurrentTurn,
  onPlayCard,
}) => {
  const { discardPile, isProtected, isEliminated } = player;

  return (
    <section
      className={`client-workspace ${isCurrentTurn ? 'active-turn' : ''}`}
    >
      <div className="client-top-bar">
        <div className="client-info-group">
          <div className="client-title-group">
            <h3>Your Hand</h3>
          </div>
          <div className="status-badges">
            {isProtected && <span className="shield-badge">🛡️ Protected</span>}
            {isEliminated && (
              <strong className="eliminated-badge">💀 Eliminated</strong>
            )}
            {isCurrentTurn && <span className="turn-badge">Your Turn!</span>}
          </div>
        </div>

        <div className="client-history-zone">
          <UserDiscardField
            discardPile={discardPile}
            title="Your Played History"
          />
        </div>
      </div>

      <div className="client-hand-container">
        <div className="client-hand-zone">
          <UserField
            player={player}
            isMyTurn={isCurrentTurn}
            onCardPlayed={onPlayCard}
          />
        </div>
      </div>
    </section>
  );
};
