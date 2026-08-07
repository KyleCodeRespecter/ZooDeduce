import { CardData, CardType } from '../../types/game.types';
import './card.css'
import { getCardDescription } from '../../engine/utils/card.utils.ts';

// Define the "Parameters" interface for this component (similar to a function signature)
interface CardProps {
  card: CardData;
  isPlayable: boolean;
  onPlay: (cardId: string) => void;
}

export function Card({ card, isPlayable, onPlay }: CardProps) {
  const cardName = CardType[card.type];
  // 2. Compute a clean CSS class name based on the enum value for custom styling per card type
  const cardStyleClass = `card-theme-${cardName.toLowerCase()}`;

  return (
    <div
      className={`card-component ${cardStyleClass} ${isPlayable ? 'playable' : 'disabled'}`}
    >
      {/* The top-corner numerical value badge */}
      <div className="card-value-badge">{card.type}</div>

      {/* Card Core Content */}
      <div className="card-body">
        <h2 className="card-title">{cardName}</h2>
        <p className="card-description">{getCardDescription(card.type)}</p>
      </div>

      {/* Conditional UI Rendering: Only show the play action if it's currently allowed */}
      {isPlayable && (
        <button className="play-card-button" onClick={() => onPlay(card.id)}>
          Play Card
        </button>
      )}
    </div>
  );
}
