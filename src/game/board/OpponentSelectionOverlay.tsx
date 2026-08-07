import { useGameEngineContext } from '../../engine/game.engine.context.ts';
import { getCardDescription } from '../../engine/utils/card.utils'; // <-- Import shared utility
import { CardType } from '../../types/game.types';

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
    <div style={styles.overlayBackdrop}>
      <div style={styles.overlayModal}>
        <h3 style={styles.title}>Playing {cardName}</h3>
        {/* Inject dynamic rule explanation text into the subtitle layer */}
        <p style={styles.subtitle}>{cardDescription}</p>
        <p style={styles.prompt}>Select an opponent to target:</p>

        <div style={styles.buttonContainer}>
          {validOpponents.map((opponent) => (
            <button
              key={opponent.id}
              style={styles.targetButton}
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
// Simple layout styling guidelines
const styles = {
  overlayBackdrop: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayModal: {
    backgroundColor: '#2a2a2a',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0px 4px 20px rgba(0,0,0,0.5)',
    textAlign: 'center' as const,
    maxWidth: '400px',
    width: '100%',
    color: '#fff',
  },
  title: { margin: '0 0 8px 0' },
  subtitle: { color: '#ccc', margin: '0 0 20px 0', fontSize: '14px' },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  targetButton: {
    padding: '12px',
    backgroundColor: '#4a90e2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    fontSize: '16px',
  },
  prompt: {
    color: '#fff',
    margin: '0 0 16px 0',
    fontSize: '15px',
    fontWeight: 'bold' as const,
  },
};
