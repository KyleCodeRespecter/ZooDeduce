import { GamePhase, GameStateSnapshot } from '../types/game.types.ts';
import { createContext, useContext } from 'react';

interface GameContextType {
  gameState: GameStateSnapshot,
  gamePhase: GamePhase
  setGamePhase: (gamePhase: GamePhase) => void,
  playCardAction: (cardID: string) => void
}

export const GameEngineContext = createContext<GameContextType | undefined>(undefined);

export function useGameEngineContext() {
  const gameContext = useContext(GameEngineContext);
  if (!gameContext)
  {
    throw new Error('::ERROR:: context must be of type GameContextType');
  }

  return gameContext;
}