
import { CardData, CardType } from '../../types/game.types';
import { Card } from './Card.tsx';
import { UserFieldProps } from '../../types/fields.types.ts';
import './user.field.css';
import { isTigerCardPlayMandatory } from '../../engine/game.manager.ts';

export function UserField({ player, isMyTurn, onCardPlayed }: UserFieldProps) {

  const forceTigerPlay = isTigerCardPlayMandatory(player.hand);

  return (
    <div
      className={`user-field-zone ${isMyTurn ? 'active-turn' : 'disabled'}`}
    >
      <h3>{player.name}'s Field</h3>

      <div className="user-field-cards-container">
        {player.hand.map((cardItem: CardData) => {
          const isThisCardPlayable = isMyTurn && (!forceTigerPlay || cardItem.type === CardType.Tiger);
          return (
          <Card
            key={cardItem.id}
            card={cardItem}
            isPlayable={ isThisCardPlayable }
            onPlay={onCardPlayed}
          />
          );
        })}
      </div>
    </div>
  );
}
