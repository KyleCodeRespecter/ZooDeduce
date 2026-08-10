import { CardData, CardType } from '../../types/game.types';
import './card.css'
import { getCardDescription } from '../../engine/utils/card.utils.ts';

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
        <p className="card-description">{getCardDescription(card.type)}</p>
      </div>

      {isPlayable && (
        <button className="play-card-button" onClick={() => onPlay(card.id)}>
          Play Card
        </button>
      )}
    </div>
  );
}
