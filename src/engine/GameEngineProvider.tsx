import React, { useEffect, useState } from 'react';
import { GameEngineContext } from './game.engine.context.ts';
import { GamePhase, GameStateSnapshot, PlayerConfig} from '../types/game.types.ts';
import {
  handleCardPlayPipeline,
  handleStartTurn,
  initializeMatch
} from './game.manager.ts';
import { gameLogger} from '../ultils/logger/logger.ts';
import { useBotBrain } from './bot-logic/use.bot.decision.ts';
import { useEngineLogging } from './use.engine.logging.ts';


export function GameEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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

    const stateAfterPlay = handleCardPlayPipeline(gameState, cardId);

    const finalizedSnapshot = handleStartTurn(stateAfterPlay);

    setGameState(finalizedSnapshot);
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
    const readyToPlaySnapshot = handleStartTurn(initializeMatch(setupConfigs));
    setGameState(readyToPlaySnapshot);
    setGamePhase(GamePhase.Gameplay);
  };

  const endGame = () => {
    // Single purpose: Lock the game phase to GameOver
    if (gamePhase === GamePhase.GameOver) return;
    setGamePhase(GamePhase.GameOver);
  };

  //useEffects
  useEngineLogging(gamePhase, gameState, setGamePhase);
  useBotBrain({ gamePhase, gameState, playCardAction });

  // Inside your GameEngineProvider component:
  useEffect(() => {
    if (
      gamePhase !== GamePhase.Gameplay ||
      !gameState ||
      !gameState.winnerId.length
    ) {
      return;
    }

    gameLogger.log(
      `Match termination detected. Finalizing phase state for ID: ${gameState.winnerId}`,
    );
    endGame();
  }, [gameState, gamePhase]);

  return (
    <GameEngineContext.Provider
      value={{
        gameState,
        gamePhase,
        setGamePhase,
        playCardAction,
        startGame,
        endGame,
      }}
    >
      {children}
    </GameEngineContext.Provider>
  );
}