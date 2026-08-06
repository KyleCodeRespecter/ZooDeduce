// src/scenes/GameOver.tsx
import { GamePhase } from '../types/game.types';
import { useEndGameState } from '../engine/game.engine.context.ts';

interface SceneProps {
  onTransition: (nextPhase: GamePhase) => void;
}

export function GameOver({ onTransition }: SceneProps) {

  const { gameState } = useEndGameState();

  return (
    <div className="game-over-screen">
      <h2>Match Over!</h2>
      <div>
        winner is {gameState.winnerId}
      </div>
      <button onClick={() => onTransition(GamePhase.MainMenu)}>
        Return to Title Screen
      </button>
    </div>
  );
}
