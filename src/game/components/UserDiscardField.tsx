// src/components/game/UserDiscardField.tsx
import { UserFieldProps } from '../../types/fields.types';
import { CardType } from '../../types/game.types';
import './user.discard.field.css'; // 👈 IMPORT THE NEW STYLE SYSTEM HERE

export function UserDiscardField({ player }: UserFieldProps) {
  return (
    <div className="user-discard-zone">
      {' '}
      {/* 👈 Clean CSS Class Selector */}
      <h4>{player.name}'s Played Cards</h4>
      <div className="discard-history-row">
        {player.discardPile.map((type: CardType, index: number) => {
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
