import { GamePhase, GameStateSnapshot } from '../types/game.types.ts';
import { createContext, useContext } from 'react';

interface GameContextType {
  gameState: GameStateSnapshot | null;
  gamePhase: GamePhase;
  setGamePhase: (gamePhase: GamePhase) => void;
  playCardAction: (cardID: string) => void;
  startGame: (opponentCount: number) => void;
}

export const GameEngineContext = createContext<GameContextType | undefined>(
  undefined,
);

export function useGameEngineContext() {
  const gameContext = useContext(GameEngineContext);
  if (!gameContext) {
    throw new Error('::ERROR:: context must be of type GameContextType');
  }

  return gameContext;
}

export function useActiveGameState() {
  const context = useGameEngineContext();

  if (context.gameState === null) {
    throw new Error(
      'CRITICAL: useActiveGameState was used, but the game has not been initialized yet. '
    );
  }

  // We return everything from the context, but overwrite gameState with a guaranteed type
  return {
    ...context,
    gameState: context.gameState
  };
}