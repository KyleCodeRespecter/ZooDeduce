import { useActiveGameState } from '../../engine/game.engine.context.ts';
import { CardType } from '../../types/card.types.ts';
import './showdown.overlay.css';
import '../components/user.discard.field.css'

export function ShowdownOverlay() {
  const { gameState, dismissShowdownAction } = useActiveGameState();
  const showdown = gameState?.showdown;

  if (!showdown) return null;

  const nameLookup = gameState.players.reduce(
    (acc, p) => ({ ...acc, [p.id]: p.name }),
    {} as Record<string, string>,
  );
  const challengerName = nameLookup[showdown.challengerId];
  const targetName = nameLookup[showdown.targetId];
  const challengerCardName = CardType[showdown.challengerCard]
    .toLowerCase()
    .replace(/\s+/g, '');
  const targetCardName = CardType[showdown.targetCard]
    .toLowerCase()
    .replace(/\s+/g, '');
  const winnerName = showdown.winnerId ? nameLookup[showdown.winnerId] : null;

  return (
    <div className="target-overlay-backdrop">
      <div className="target-overlay-modal showdown-modal">
        <h3 className="target-overlay-title">Stag Beetle Showdown!</h3>

        <div className="showdown-arena">
          <div className="showdown-fighter">
            <h4>{challengerName}</h4>
            <div
              className={`mini-history-card theme-${challengerCardName} showdown-revealed-card`}
            >
              <span className="card-value-prefix">
                [{showdown.challengerCard}]
              </span>
              {CardType[showdown.challengerCard]}
            </div>
          </div>

          <div className="showdown-vs">VS</div>

          <div className="showdown-fighter">
            <h4>{targetName}</h4>
            <div
              className={`mini-history-card theme-${targetCardName} showdown-revealed-card`}
            >
              <span className="card-value-prefix">[{showdown.targetCard}]</span>
              {CardType[showdown.targetCard]}
            </div>
          </div>
        </div>

        <div className="showdown-result-declaration">
          {winnerName ? (
            <p>
              <b>{winnerName}</b> wins the duel!
            </p>
          ) : (
            <p>
              <b>TIE</b>! Both players survive the clash.
            </p>
          )}
        </div>

        <button
          className="target-player-button"
          onClick={dismissShowdownAction}
        >
          Acknowledge Duel Result
        </button>
      </div>
    </div>
  );
}
