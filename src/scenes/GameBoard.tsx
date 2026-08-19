
import React, { useState } from 'react';
import { useActiveGameState } from '../engine/game.engine.context';
import { BoardHeader } from '../game/board/BoardHeader';
import { OpponentViewport } from '../game/board/OpponentViewport';
import { ClientWorkspace } from '../game/board/ClientWorkspace';
import { TargetSelectionOverlay } from '../game/board/TargetSelectionOverlay';
import { CardViewOverlay } from '../game/board/CardViewOverlay.tsx';
import { HandSelectionOverlay } from '../game/board/HandSelectionOverlay.tsx';
import { ShowdownOverlay } from '../game/board/ShowdownOverlay.tsx';
import { OwlNoticeOverlay } from '../game/board/OwlNoticeOverlay.tsx';
import '../game/board/board.styles.css';
import '../ultils/button.styles.css';
import { RulesGuideModal } from '../game/components/RuleGuideModal.tsx';

export const GameBoard: React.FC = () => {
  const { gameState, playCardAction, dismissPeekAction } = useActiveGameState();
  const { players, currentPlayerIndex, deck, burnedCards } = gameState;
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

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
      {isRulesOpen && <RulesGuideModal onClose={() => setIsRulesOpen(false)} />}
      <div className="board-top-meta-group">
        <BoardHeader
          activePlayerName={activePlayer?.name ?? 'Unknown'}
          deckCount={deck.length}
          burnCount={burnedCards.length}
        />
        <button
          className="in-game-rules-toggle"
          onClick={() => setIsRulesOpen(true)}
        >
          Rules
        </button>
      </div>
      <TargetSelectionOverlay />
      <OwlNoticeOverlay />
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
        {opponents.map((opp) => {
          // Find the true absolute index of this bot inside the original players array
          const absoluteIndex = gameState.players.findIndex(
            (p) => p.id === opp.id,
          );

          return (
            <OpponentViewport
              key={opp.id}
              opponent={opp}
              isCurrentTurn={players[currentPlayerIndex]?.id === opp.id}
              style={{ borderColor: `var(--player-color-${absoluteIndex})` }}
            />
          );
        })}
      </section>

      <ClientWorkspace
        player={clientPlayer}
        isCurrentTurn={activePlayer?.id === clientPlayer.id}
        onPlayCard={playCardAction}
        actionFeed={gameState.actionFeed ?? []}
        style={{
          borderColor: `var(--player-color-${gameState.players.findIndex(
            (p) => p.id === clientPlayer.id,
          )})`,
        }}
      />
    </div>
  );
};
