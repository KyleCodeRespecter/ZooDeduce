import { PlayerData } from '../../types/game.types';

interface OpponentPickerProps {
  cardName: string;
  cardDescription: string;
  validOpponents: PlayerData[];
  onSelect: (opponentId: string) => void;
}

export function OpponentPicker({
  cardName,
  cardDescription,
  validOpponents,
  onSelect,
}: OpponentPickerProps) {
  return (
    <>
      <h3 className="target-overlay-title">Playing {cardName}</h3>
      <p className="target-overlay-subtitle">{cardDescription}</p>
      <p className="target-overlay-prompt">Select an opponent to target:</p>

      <div className="target-overlay-list">
        {validOpponents.map((opponent) => (
          <button
            key={opponent.id}
            className="target-player-button"
            onClick={() => onSelect(opponent.id)}
          >
            {opponent.name}
          </button>
        ))}
      </div>
    </>
  );
}
