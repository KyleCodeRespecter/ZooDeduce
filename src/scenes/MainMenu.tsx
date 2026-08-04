// MainMenu.tsx
import { GamePhase } from '../types/game.types.ts';

interface MainMenuProps {
  onTransition: (nextPhase: GamePhase) => void;
}

export function MainMenu({ onTransition }: MainMenuProps) {
  // Look mom, no DOM manipulation, no IDs, no selectors!
  return (
    <div className="menu-screen">
      <h1>Zoo Deduce</h1>
      <p>Deduce your fellow zoo animals</p>
      <button onClick={ () => onTransition(GamePhase.Gameplay)}>Play Game</button>
    </div>
  );
}
