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

  const playCardAction = (
    cardId: string,
    selectedTargetId: string | null = null,
  ) => {
    if (!gameState) return;
    const activePlayer = gameState.players[gameState.currentPlayerIndex];

    // 1. Run engine pipeline (will halt early for humans if targetId is null)
    const stateAfterPlay = handleCardPlayPipeline(
      gameState,
      cardId,
      selectedTargetId,
    );

    // 2. Human Overlay Check: If engine returned an active target request, freeze UI updates
    if (stateAfterPlay.activeTargetRequest !== null) {
      setGameState(stateAfterPlay);
      return;
    }

    // 3. Complete and advance the rotation turn loop
    const finalizedSnapshot = handleStartTurn(stateAfterPlay);

    setGameState(finalizedSnapshot);
    gameLogger.logPlayerAction(
      activePlayer.name,
      `triggered a card resolution pipeline for instance ID: ${cardId}. Target: ${selectedTargetId ?? 'auto/none'}`,
    );
  };

  // Explicit UI click execution channel for Human Player Overlays
  const selectTargetAction = (targetPlayerId: string) => {
    if (!gameState?.activeTargetRequest) return;

    // Re-run standard actions passing the targeted player's unique identity forward
    playCardAction(gameState.activeTargetRequest.cardId, targetPlayerId);
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
      }}
    >
      {children}
    </GameEngineContext.Provider>
  );
}