import { GamePhase, GameStateSnapshot } from '../types/game.types.ts';
import { createContext, useContext } from 'react';

interface GameContextType {
  gameState: GameStateSnapshot | null;
  gamePhase: GamePhase;
  setGamePhase: (gamePhase: GamePhase) => void;
  selectTargetAction: (targetPlayerId: string) => void;
  playCardAction: (cardID: string) => void;
  startGame: (opponentCount: number) => void;
  endGame: () => void;
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
      'CRITICAL: useActiveGameState was used, but the game has not been initialized yet.',
    );
  }

  return {
    ...context,
    gameState: context.gameState,
  };
}

export function useEndGameState() {
  const context = useActiveGameState();

  if (context.gamePhase !== GamePhase.GameOver) {
    throw new Error(
      'CRITICAL: useEndGameState was used, but the game phase is not GameOver.',
    );
  }

  return {
    ...context,
    gameState: context.gameState,
  };
}
