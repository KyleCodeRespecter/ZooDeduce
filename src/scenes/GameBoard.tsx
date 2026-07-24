// src/scenes/GameBoard.tsx
interface SceneProps {
  onTransition: (nextPhase: any) => void;
}

export function GameBoard({  }: SceneProps) {
  return (
    <div className="game-screen">
      <h2>The Royal Courtyard</h2>
      <p>Cards are being dealt... Simulation active.</p>
    </div>
  );
}
