import React, { useEffect, useState } from 'react';
import { GameEngineContext } from './game.engine.context.ts';
import { CardType, GamePhase, GameStateSnapshot, PlayerConfig } from '../types/game.types.ts';
import {
  handleCardPlayPipeline, handlePeekTurn,
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

  const dismissPeekAction = () => {
    if (!gameState) return;
    const nextState = handlePeekTurn(gameState);
    setGameState(nextState);
  };

  const playCardAction = (
    cardId: string,
    selectedTargetId: string | null = null,
    declaredGuessValue: CardType | null = null,
  ) => {
    if (!gameState) return;

    const activePlayer = gameState.players?.[gameState.currentPlayerIndex];

    const stateAfterPlay = handleCardPlayPipeline(
      gameState,
      cardId,
      selectedTargetId,
      declaredGuessValue,
    );

    // handle target requests
    if (
      stateAfterPlay.activeTargetRequest !== null ||
      stateAfterPlay.targetPeekRequest !== null
    ) {
      setGameState(stateAfterPlay);
      return; // Safe freeze. Awaits overlay menu selections.
    }

    // start turn for next player
    const finalizedSnapshot = handleStartTurn(stateAfterPlay);
    setGameState(finalizedSnapshot);

    if (activePlayer && gameLogger) {
      gameLogger.logPlayerAction(
        activePlayer.name,
        `resolved card pipeline for instance ID: ${cardId}. Target: ${selectedTargetId ?? 'auto/none'}`,
      );
    }
  };


  const selectTargetAction = (targetPlayerId: string) => {
    if (!gameState?.activeTargetRequest) return;

    const request = gameState.activeTargetRequest;
    
    if (!request.requiresGuess) {
      playCardAction(request.cardId, targetPlayerId, null);
    }
  };

  const startGame = (opponentCount: number) => {
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
    if (gamePhase === GamePhase.GameOver) return;
    setGamePhase(GamePhase.GameOver);
  };

  //useEffects
  useEngineLogging(gamePhase, gameState, setGamePhase);
  useBotBrain({ gamePhase, gameState, playCardAction });

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
        selectTargetAction,
        startGame,
        endGame,
        dismissPeekAction
      }}
    >
      {children}
    </GameEngineContext.Provider>
  );
}