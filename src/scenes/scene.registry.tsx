// src/scenes/SceneRegistry.tsx
import React from 'react';
import { GamePhase } from '../types/game.types';
import { MainMenu } from '../screens/main-menu'; // Ensure path matches your project
import { GameBoard } from './game.board';
import { GameOver } from './game.over';

/**
 * Define the Prop requirements for ANY component registering as a macro game scene.
 * This ensures strict interface contract safety when pulling components out dynamically.
 */
interface BaseSceneProps {
  onTransition: (nextPhase: GamePhase) => void;
}

/**
 * THE CENTRAL ENGINE SCENE MAP
 * Maps each GamePhase enum directly to its corresponding React layout prefab.
 */
export const SCENE_REGISTRY: Record<
  GamePhase,
  React.ComponentType<BaseSceneProps>
> = {
  [GamePhase.MainMenu]: MainMenu,
  [GamePhase.Gameplay]: GameBoard,
  [GamePhase.GameOver]: GameOver,
};
