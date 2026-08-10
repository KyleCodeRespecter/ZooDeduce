import { useState } from 'react';
import { GamePhase } from '../types/game.types.ts';
import { BotCountSelector } from '../game/components/main-menu/OpponentSelector.tsx';
import { useGameEngineContext } from '../engine/game.engine.context.ts';

interface MainMenuProps {
  onTransition: (nextPhase: GamePhase) => void;
}

export function MainMenu({ onTransition }: MainMenuProps) {
  const [opponentCount, setOpponentCount] = useState<number>(2);
  const { startGame } = useGameEngineContext();

  const handlePlayGame = () => {
    startGame(opponentCount);
    onTransition(GamePhase.Gameplay);
  };

  return (
    <div className="menu-screen">
      <h1>Zoo Deduce</h1>
      <p>Deduce your fellow zoo animals</p>

      <BotCountSelector onBotCountChange={setOpponentCount} />

      <button className="play-game-button" onClick={handlePlayGame}>
        Play Game
      </button>
    </div>
  );
}
