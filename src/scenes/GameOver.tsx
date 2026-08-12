import { GamePhase } from '../types/game.types';
import { useEndGameState } from '../engine/game.engine.context.ts';

interface SceneProps {
  onTransition: (nextPhase: GamePhase) => void;
}

export function GameOver({ onTransition }: SceneProps) {
  const { gameState } = useEndGameState();
  const { players, winnerId } = gameState; // Pull data from state context
  const winnerIdsArray = winnerId
    ? winnerId.split(',').map((id) => id.trim())
    : [];
  const winningPlayers = players.filter((player) =>
    winnerIdsArray.includes(player.id),
  );
  let victoryDeclarationText = 'No clear victor declared.';

  if (winningPlayers.length === 1) {
    victoryDeclarationText = `${winningPlayers[0].name} wins the match!`;
  } else if (winningPlayers.length > 1) {
    const jointNamesText = winningPlayers.map((p) => p.name).join(' & ');
    victoryDeclarationText = `Joint Victory! Congratulations to ${jointNamesText}!`;
  }

  return (
    <div className="game-over-screen">
      <h2>Match Over!</h2>
      <div>winner is {victoryDeclarationText}</div>
      <button onClick={() => onTransition(GamePhase.MainMenu)}>
        Return to Title Screen
      </button>
    </div>
  );
}
