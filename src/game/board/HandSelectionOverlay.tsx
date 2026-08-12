import { useActiveGameState } from '../../engine/game.engine.context.ts';
import { Card } from '../components/Card.tsx';
import './hand.selection.overlay.css'

export function HandSelectionOverlay() {
  const { gameState, selectHandCardAction } = useActiveGameState();

  const choices = gameState?.cardSelectRequest;

  // If no choices array is populated in the state snapshot, hide the overlay completely
  if (!choices || choices.length === 0) return null;

  return (
    <div className="target-overlay-backdrop">
      <div className="target-overlay-modal beaver-modal">
        <h3 className="target-overlay-title">Beaver Card Selection</h3>
        <p className="target-overlay-prompt">
          Select exactly <b>ONE</b> card to retain in your active hand. The
          remaining choices will return to the deck.
        </p>

        <div className="card-view-list">
          {choices.map((cardItem) => (
            <button
              key={cardItem.id}
              className="beaver-choice-card-btn"
              onClick={() => selectHandCardAction(cardItem.id)}
            >
              {/* Force isPlayable to false so clicking the inner layout passes focus to our parent button */}
              <Card card={cardItem} isPlayable={false} onPlay={() => {}} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
