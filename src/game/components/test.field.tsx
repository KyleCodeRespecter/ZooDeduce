// src/components/game/TestBench.tsx
import { CardType } from '../../types/game.types';
import { UserField } from './user.field';
import { UserDiscardField } from './user.discard.field.tsx';

export function TestBench() {
  const mockPlayer = {
    id: 'player-1',
    name: 'Challenger One',
    hand: [
      { id: 'c1', type: CardType.Tiger },
      { id: 'c2', type: CardType.Beaver },
      { id: 'c3', type: CardType.StagBeetle },
      { id: 'c4', type: CardType.Peacock },
    ],
    discardPile: [CardType.Meerkat, CardType.StagBeetle],
    isEliminated: false,
    isProtected: false,
  };

  return (
    <div
      style={{ marginTop: '40px', padding: '20px', border: '6px solid #ccc' }}
    >
      <h3>Engine Test Bench: Visual Card Preview</h3>
      <UserDiscardField
        player={mockPlayer}
        isMyTurn={true}
        onCardPlayed={() => {} }
      />
      <UserField
        player={mockPlayer}
        isMyTurn={true}
        onCardPlayed={(id) => console.log(`Card played: ${id}`)}
      />
    </div>
  );
}
