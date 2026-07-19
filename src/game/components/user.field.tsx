import { CardData } from '../../types/game.types';
import { Card } from './card.tsx'; // Assuming your file is named Card.tsx
import { UserFieldProps } from '../../types/fields.types.ts';


export function UserField({ player, isMyTurn, onCardPlayed }: UserFieldProps) {
  return (
    <div
      style={{
        marginTop: '40px',
        padding: '20px',
        border: '6px solid #ccc',
        borderRadius: '16px',
      }}
    >
      <h3>{player.name}'s Field</h3>

      {/*
        This is the functional equivalent of your loop!
        It iterates through the player.hand array and instantiates a
        Card component layout row automatically.
      */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {player.hand.map((cardItem: CardData) => (
          <Card
            key={cardItem.id} // Mandatory anchor so React tracks this specific object pointer
            card={cardItem}
            isPlayable={isMyTurn}
            onPlay={onCardPlayed}
          />
        ))}
      </div>
    </div>
  );
}
