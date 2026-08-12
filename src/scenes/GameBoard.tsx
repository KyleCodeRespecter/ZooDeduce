
import React from 'react';
import { useActiveGameState } from '../engine/game.engine.context';
import { BoardHeader } from '../game/board/BoardHeader';
import { OpponentViewport } from '../game/board/OpponentViewport';
import { ClientWorkspace } from '../game/board/ClientWorkspace';
import '../game/board/board.styles.css';
import { TargetSelectionOverlay } from '../game/board/TargetSelectionOverlay';
import { CardViewOverlay } from '../game/board/CardViewOverlay.tsx';
import { HandSelectionOverlay } from '../game/board/HandSelectionOverlay.tsx';
import { ShowdownOverlay } from '../game/board/ShowdownOverlay.tsx';
import { OwlNoticeOverlay } from '../game/board/OwlNoticeOverlay.tsx';

export const GameBoard: React.FC = () => {
  const { gameState, playCardAction, dismissPeekAction } = useActiveGameState();
  const { players, currentPlayerIndex, deck, burnedCards } = gameState;

  // Resolve active, client, and opponent player data views
  const activePlayer = players[currentPlayerIndex];
  const clientPlayer = players[0];
  const opponents = players.filter((p) => p.id !== clientPlayer.id);
  const peekTargetOpponent = gameState.targetPeekRequest
    ? gameState.players.find((p) => p.id === gameState.targetPeekRequest)
    : null;
  const shouldSurfacePeekModal =
    peekTargetOpponent !== null && activePlayer.id === clientPlayer.id;

  // Show the hand details window only if a human initiated the Owl card execution look
  const cardsToReveal =
    shouldSurfacePeekModal && peekTargetOpponent ? peekTargetOpponent.hand : [];

  const isBeaverSelectionActive = gameState.cardSelectRequest !== null;
  const isHumanTurn = activePlayer.id === clientPlayer.id;
  const shouldShowBeaverOverlay = isBeaverSelectionActive && isHumanTurn;

  const showdown = gameState.showdown;
  const isShowdownActive = showdown !== null;

  const isHumanFighterInvolved =
    isShowdownActive &&
    (showdown.challengerId === clientPlayer.id ||
      showdown.targetId === clientPlayer.id);

  const shouldShowShowdownOverlay = isShowdownActive && isHumanFighterInvolved;

  return (
    <div className="game-board-container">
      <BoardHeader
        activePlayerName={activePlayer?.name ?? 'Unknown'}
        deckCount={deck.length}
        burnCount={burnedCards.length}
      />
      <TargetSelectionOverlay />
      <OwlNoticeOverlay/>
      {shouldShowBeaverOverlay && <HandSelectionOverlay />}
      {shouldShowShowdownOverlay && <ShowdownOverlay />}
      {shouldSurfacePeekModal && (
        <CardViewOverlay
          title={
            activePlayer.id === clientPlayer.id
              ? `Owl Vision: Inspecting ${peekTargetOpponent?.name}'s Hand`
              : `TARGET NOTICE: ${activePlayer.name} utilized Owl to peek at YOUR hand!`
          }
          cardsToShow={cardsToReveal}
          onAcknowledge={dismissPeekAction}
          buttonText="Close Inspection Eye"
        />
      )}
      <section className="opponents-zone">
        {opponents.map((opp) => (
          <OpponentViewport
            key={opp.id}
            opponent={opp}
            isCurrentTurn={players[currentPlayerIndex]?.id === opp.id}
          />
        ))}
      </section>

      <ClientWorkspace
        player={clientPlayer}
        isCurrentTurn={activePlayer?.id === clientPlayer.id}
        onPlayCard={playCardAction}
      />
    </div>
  );
};
