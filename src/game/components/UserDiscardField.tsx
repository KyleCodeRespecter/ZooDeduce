import { CardType } from '../../types/card.types.ts';
import { UserDiscardFieldProps } from '../../types/fields.types';
import './user.discard.field.css';

export function UserDiscardField({
  discardPile,
  title,
}: UserDiscardFieldProps) {
  return (
    <div className="user-discard-zone">
      {title && <h4>{title}</h4>}
      <div className="discard-history-row">
        {discardPile.map((type: CardType, index: number) => {
          const cardName = CardType[type];

          return (
            <div
              key={index}
              className={`mini-history-card theme-${cardName.toLowerCase()}`}
            >
              <span className="mini-card-name">{cardName}</span>
              <span className="mini-card-value">({type})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
