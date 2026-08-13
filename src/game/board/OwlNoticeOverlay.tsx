import { useActiveGameState } from '../../engine/game.engine.context.ts';
import './showdown.overlay.css';

export function OwlNoticeOverlay() {
  const { gameState, dismissOwlNoticeAction } = useActiveGameState();
  const notice = gameState?.owlNotice;

  if (!notice) return null;

  const nameLookup = gameState.players.reduce(
    (acc, p) => ({ ...acc, [p.id]: p.name }),
    {} as Record<string, string>,
  );
  const casterName = nameLookup[notice.casterId] || 'An opponent';

  return (
    <div className="target-overlay-backdrop">
      <div className="target-overlay-modal showdown-modal">
        <h3 className="target-overlay-title" style={{ color: '#ff4a4a' }}>
          Alert
        </h3>

        <div
          className="showdown-result-declaration has-elimination"
          style={{ margin: '1.5rem 0', padding: '1.25rem' }}
        >
          <p
            style={{
              fontSize: '1.05rem',
              textAlign: 'center',
              lineHeight: '1.5',
            }}
          >
            <b>{casterName}</b> played an <b>Owl card</b> and peeked at your hand
          </p>
        </div>

        <button
          className="target-player-button"
          onClick={dismissOwlNoticeAction}
        >
          Acknowledge Notice
        </button>
      </div>
    </div>
  );
}
