import { useGameEngineContext } from '../../engine/game.engine.context.ts';
import { getCardDescription } from '../../engine/utils/card.utils';
import { CardType } from '../../types/game.types';
import './opponent.selection.overlay.css'; // Make sure this path points to your new CSS file!

export function TargetSelectionOverlay() {
  const { gameState, selectTargetAction } = useGameEngineContext();

  const request = gameState?.activeTargetRequest;
  if (!request || !gameState) return null;

  // Locate the active player and find the card triggering the targeting choice
  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  const playedCard = activePlayer.hand.find((c) => c.id === request.cardId);

  // Compute display info based on the card type
  const cardName = playedCard ? CardType[playedCard.type] : 'Card';
  const cardDescription = playedCard ? getCardDescription(playedCard.type) : '';

  const validOpponents = gameState.players.filter((p) =>
    request.validTargetIds.includes(p.id),
  );

  return (
    <div className="target-overlay-backdrop">
      <div className="target-overlay-modal">
        <h3 className="target-overlay-title">Playing {cardName}</h3>

        {/* Inject dynamic rule explanation text into the subtitle layer */}
        <p className="target-overlay-subtitle">{cardDescription}</p>
        <p className="target-overlay-prompt">Select an opponent to target:</p>

        {/* Updated from buttonContainer to target-overlay-list to match your CSS file */}
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
