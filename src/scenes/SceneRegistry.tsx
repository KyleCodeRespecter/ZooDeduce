// src/scenes/SceneRegistry.tsx
import React from 'react';
import { GamePhase } from '../types/game.types';
import { MainMenu } from './MainMenu.tsx';
import { GameBoard } from './GameBoard.tsx';
import { GameOver } from './GameOver.tsx';


interface BaseSceneProps {
  onTransition: (nextPhase: GamePhase) => void;
}


export const SCENE_REGISTRY: Readonly<
  Record<GamePhase, React.ComponentType<BaseSceneProps>>
> = Object.freeze({
  [GamePhase.MainMenu]: MainMenu,
  [GamePhase.Gameplay]: GameBoard,
  [GamePhase.GameOver]: GameOver,
});
