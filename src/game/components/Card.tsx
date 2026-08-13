import { CardData, CardType } from '../../types/game.types';
import './card.css'

interface CardProps {
  card: CardData;
  isPlayable: boolean;
  onPlay: (cardId: string) => void;
}

export function Card({ card, isPlayable, onPlay }: CardProps) {
  const cardName = CardType[card.type];
  const cardStyleClass = `card-theme-${cardName.toLowerCase()}`;

  return (
    <div
      className={`card-component ${cardStyleClass} ${isPlayable ? 'playable' : 'disabled'}`}
    >
      <div className="card-value-badge">{card.type}</div>

      <div className="card-body">
        <h2 className="card-title">{cardName}</h2>
      {isPlayable && (
        <button className="play-card-button" onClick={() => onPlay(card.id)}>
          Play Card
        </button>
      )}
      </div>

    </div>
  );
}
