import React from 'react';
import { createRoot } from 'react-dom/client';
import { GamePhase } from './types/game.types';
import { SCENE_REGISTRY } from './scenes/SceneRegistry.tsx';
import './index.css';
import { GameEngineProvider } from './engine/GameEngineProvider.tsx';
import { useGameEngineContext } from './engine/game.engine.context.ts';
// import { TestBench } from './game/components/TestBench.tsx';

export function App() {
  // 1. Core State-Machine pointer tracker
  const {gamePhase, setGamePhase} = useGameEngineContext();

  // 2. Fetch the corresponding constructor layout from our registry dictionary
  const ActiveScene = SCENE_REGISTRY[gamePhase];

  return (
    <div className="game-app-viewport">
      {/* 3. Instantiate the active engine widget panel dynamically */}
      <ActiveScene
        onTransition={(nextPhase: GamePhase) => setGamePhase(nextPhase)}
      />
      {/*<TestBench></TestBench>*/}
    </div>
  );
}

const container = document.getElementById('game-app');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <GameEngineProvider>
        <App />
      </GameEngineProvider>
    </React.StrictMode>,
  );
}
