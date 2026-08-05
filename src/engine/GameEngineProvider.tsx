import React, { useState } from 'react';
import { GameEngineContext } from './game.engine.context.ts';
import { GamePhase, GameStateSnapshot, PlayerConfig} from '../types/game.types.ts';
import { handleCardPlayPipeline, initializeMatch } from './game.manager.ts';
import { gameLogger} from '../ultils/logger/logger.ts';
import { useBotBrain } from './bot-logic/use.bot.decision.ts';
import { useEngineLogging } from './use.engine.logging.ts';


export function GameEngineProvider({ children }: { children: React.ReactNode }) {
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.MainMenu);
  const [gameState, setGameState] = useState<GameStateSnapshot | null>(null);

  const playCardAction = (cardId: string) => {
    if (!gameState) {
      console.error(
        'Action rejected: Cannot play card action while gameState is null.',
      );
      return;
    }
    const activePlayer = gameState.players[gameState.currentPlayerIndex];

    // 1. Run the pure state pipeline to calculate the new snapshot
    const updatedSnapshot = handleCardPlayPipeline(gameState, cardId);

    // 2. Save it back to React state to trigger re-renders and the logger
    setGameState(updatedSnapshot);
    gameLogger.logPlayerAction(
      activePlayer.name,
      `triggered a card resolution pipeline for instance ID: ${cardId}`,
    );
  };

  const startGame = (opponentCount: number) => {
    // Generate the player array dynamically based on the input number
    const setupConfigs: PlayerConfig[] = [
      { name: 'HumanPlayer_1', isBot: false },
      ...Array.from({ length: opponentCount }, (_, i) => ({
        name: `Bot_${i + 1}`,
        isBot: true,
      })),
    ];

    // Initialize the engine match data structure
    const initialSnapshot = initializeMatch(setupConfigs);

    // Save it to state so the gameplay scene can read it
    setGameState(initialSnapshot);
  };

  //useEffects
  useEngineLogging(gamePhase, gameState, setGamePhase);
  useBotBrain({ gamePhase, gameState, playCardAction });




  return (
    <GameEngineContext.Provider
      value={{ gameState, gamePhase, setGamePhase, playCardAction, startGame }}
    >
      {children}
    </GameEngineContext.Provider>
  );
}