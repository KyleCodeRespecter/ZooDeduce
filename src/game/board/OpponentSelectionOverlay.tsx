import { useEffect } from 'react';
import { useGameEngineContext } from '../../engine/game.engine.context.ts';
import { getCardDescription } from '../../engine/utils/card.utils';
import { CardType } from '../../types/game.types';
import './opponent.selection.overlay.css';

export function TargetSelectionOverlay() {
  const { gameState, selectTargetAction } = useGameEngineContext();

  // 1. SAFE DATA EXTRACTS (No conditional returns yet)
  const request = gameState?.activeTargetRequest;
  const activePlayer = gameState?.players[gameState.currentPlayerIndex];
  const playedCard = activePlayer?.hand.find((c) => c.id === request?.cardId);

  const cardName = playedCard ? CardType[playedCard.type] : 'Card';
  const cardDescription = playedCard ? getCardDescription(playedCard.type) : '';

  const validOpponents = gameState
    ? gameState.players.filter((p) => request?.validTargetIds.includes(p.id))
    : [];

  // 2. LIFECYCLE HOOK PLACEMENT
  useEffect(() => {
    // Safety guard inside the hook body instead of above it
    if (!request || !playedCard) return;

    const hasSingleTarget = validOpponents.length === 1;
    const isNotRhino = playedCard.type !== CardType.Rhino;

    if (hasSingleTarget && isNotRhino) {
      selectTargetAction(validOpponents[0].id);
    }
  }, [validOpponents, playedCard, request, selectTargetAction]);

  // 3. SECURE RETURN GUARDS PLACED HERE
  // React requires hooks to be completely declared before executing early exits
  if (!request || !gameState) return null;

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
