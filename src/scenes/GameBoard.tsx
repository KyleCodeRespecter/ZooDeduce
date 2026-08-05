// src/scenes/GameBoard.tsx

import React from 'react';
import { useActiveGameState } from '../engine/game.engine.context';
import { BoardHeader } from '../game/board/BoardHeader';
import { OpponentViewport } from '../game/board/OpponentViewport';
import { ClientWorkspace } from '../game/board/ClientWorkspace';
import '../game/board/board.styles.css';

export const GameBoard: React.FC = () => {
  const { gameState, playCardAction } = useActiveGameState();
  const { players, currentPlayerIndex, deck, burnedCards } = gameState;

  // Resolve active, client, and opponent player data views
  const activePlayer = players[currentPlayerIndex];
  const clientPlayer = players[0];
  const opponents = players.filter((p) => p.id !== clientPlayer.id);

  return (
    <div className="game-board-container">
      {/* 1. Global Match Telemetry Header */}
      <BoardHeader
        activePlayerName={activePlayer?.name ?? 'Unknown'}
        deckCount={deck.length}
        burnCount={burnedCards.length}
      />

      {/* 2. Opponents Deductive Viewports Zone */}
      <section className="opponents-zone">
        {opponents.map((opp) => (
          <OpponentViewport
            key={opp.id}
            opponent={opp}
            isCurrentTurn={players[currentPlayerIndex]?.id === opp.id}
          />
        ))}
      </section>

      {/* 3. Interactive Client Workspace */}
      <ClientWorkspace
        player={clientPlayer}
        isCurrentTurn={activePlayer?.id === clientPlayer.id}
        onPlayCard={playCardAction}
      />
    </div>
  );
};
