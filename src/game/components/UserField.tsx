
import { CardData } from '../../types/game.types';
import { Card } from './Card.tsx';
import { UserFieldProps } from '../../types/fields.types.ts';
import './user.field.css';

export function UserField({ player, isMyTurn, onCardPlayed }: UserFieldProps) {
  return (
    <div
      className={`user-field-zone ${isMyTurn ? 'active-turn' : 'disabled'}`}
    >
      <h3>{player.name}'s Field</h3>

      <div className="user-field-cards-container">
        {player.hand.map((cardItem: CardData) => (
          <Card
            key={cardItem.id}
            card={cardItem}
            isPlayable={isMyTurn}
            onPlay={onCardPlayed}
          />
        ))}
      </div>
    </div>
  );
}
