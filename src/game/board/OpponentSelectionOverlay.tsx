// src/components/game/TargetSelectionOverlay.tsx
import { useEffect } from 'react';
import { useGameEngineContext } from '../../engine/game.engine.context.ts';
import { getCardDescription } from '../../engine/utils/card.utils';
import { CardType } from '../../types/game.types';
import './opponent.selection.overlay.css';

export function TargetSelectionOverlay() {
  const { gameState, selectTargetAction } = useGameEngineContext();

  const request = gameState?.activeTargetRequest;
  if (!request || !gameState) return null;

  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  const playedCard = activePlayer.hand.find((c) => c.id === request.cardId);

  const cardName = playedCard ? CardType[playedCard.type] : 'Card';
  const cardDescription = playedCard ? getCardDescription(playedCard.type) : '';

  const validOpponents = gameState.players.filter((p) =>
    request.validTargetIds.includes(p.id),
  );

  useEffect(() => {
    // 1. Guard: Check if there is exactly 1 valid target remaining
    const hasSingleTarget = validOpponents.length === 1;

    // 2. Guard: Ensure the card is NOT a Rhino card (Rhino can target the player themselves)
    const isNotRhino = playedCard?.type !== CardType.Rhino;

    if (hasSingleTarget && isNotRhino) {
      // Automatically target the lone opponent without waiting for user input
      selectTargetAction(validOpponents[0].id);
    }
  }, [validOpponents, playedCard, selectTargetAction]);

  // If we are auto-selecting this turn, return null early to block the layout flash
  const isNotRhino = playedCard?.type !== CardType.Rhino;
  if (validOpponents.length === 1 && isNotRhino) {
    return null;
  }

  return (
    <div className="target-overlay-backdrop">
      <div className="target-overlay-modal">
        <h3 className="target-overlay-title">Playing {cardName}</h3>
        <p className="target-overlay-subtitle">{cardDescription}</p>
        <p className="target-overlay-prompt">Select an opponent to target:</p>

        <div className="target-overlay-list">
          {validOpponents.map((opponent) => (
            <button
              key={opponent.id}
              className="target-player-button"
              onClick={() => selectTargetAction(opponent.id)}
            >
              {opponent.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
