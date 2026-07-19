import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GamePhase } from './types/game.types';
import { SCENE_REGISTRY } from './scenes/scene.registry';
import { TestBench } from './game/components/test.field';
import './index.css';

export function App() {
  // 1. Core State-Machine pointer tracker
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MainMenu);

  // 2. Fetch the corresponding constructor layout from our registry dictionary
  const ActiveScene = SCENE_REGISTRY[phase];

  const SHOW_TEST_BENCH = true;

  return (
    <div className="game-app-viewport">
      {/* 3. Instantiate the active engine widget panel dynamically */}
      <ActiveScene
        onTransition={(nextPhase: GamePhase) => setPhase(nextPhase)}
      />

      {/* Isolated debug overlay layer remains safely partitioned */}
      {SHOW_TEST_BENCH && phase === GamePhase.MainMenu && <TestBench />}
    </div>
  );
}

const container = document.getElementById('game-app');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
