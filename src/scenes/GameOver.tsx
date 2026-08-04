// src/scenes/GameOver.tsx
import { GamePhase } from '../types/game.types';

interface SceneProps {
  onTransition: (nextPhase: GamePhase) => void;
}

export function GameOver({ onTransition }: SceneProps) {
  return (
    <div className="game-over-screen">
      <h2>Match Over!</h2>
      <button onClick={() => onTransition(GamePhase.MainMenu)}>
        Return to Title Screen
      </button>
    </div>
  );
}
