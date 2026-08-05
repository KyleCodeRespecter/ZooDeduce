import React, { useEffect, useState } from 'react';
import { GameEngineContext } from './game.engine.context.ts';
import { CardType, GamePhase, GameStateSnapshot, PlayerConfig} from '../types/game.types.ts';
import { handleCardPlayPipeline, initializeMatch } from './game.manager.ts';
import { gameLogger} from '../ultils/logger/logger.ts';
import { executeBotDecisionEngine } from './bot-logic/bot.manager.ts';


export function GameEngineProvider({ children }: { children: React.ReactNode }) {
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.MainMenu);
  const [gameState, setGameState] = useState<GameStateSnapshot | null>(null);

  useEffect(() => {
    if (gamePhase != GamePhase.Gameplay) {
      return;
    }
    if (!gameState)
    {
      return;
    }

    if (!gameState.burnedCards) {
      gameLogger.logSystemAlert(
        'CRITICAL SUBSYSTEM ANOMALY: burnCards data structure is NULL. ' +
        'Halting current game loop and forcing automatic subsystem reset.'
      );
      // Force an automatic soft-reset back to the safe Main Menu state machine phase
      setGamePhase(GamePhase.MainMenu);

      return;
    }
    gameLogger.logEngineTick(gamePhase);

    gameLogger.log('Current Active Deck Size:', gameState.deck.length);
      gameLogger.log(
        'Burned Cards Active Seed:',
        gameState.burnedCards.map(
          card => `${CardType[card.type]} (${card.type})`).join(', '));
    gameLogger.log('Current Active Player Index Reference:', gameState.currentPlayerIndex);

    console.table(
      gameState.players.map((player) => ({
        Name: player.name,
        CardsInHand: player.hand.map((card) => CardType[card.type]).join(', '),
        DiscardPileHistory: player.discardPile
          .map((type) => CardType[type])
          .join(', '),
        IsEliminated: player.isEliminated,
        IsProtected: player.isProtected,
      })),
    );

    gameLogger.closeGroup();
  }, [gameState, gamePhase]);

  useEffect(() => {
    if (gamePhase !== GamePhase.Gameplay || !gameState) return;

    const activePlayer = gameState.players[gameState.currentPlayerIndex];

    // 1. Clean boolean switch. No string scanning!
    if (!activePlayer.isBot || activePlayer.isEliminated) {
      return;
    }

    // 2. Query the selection pipeline
    const botCardId = executeBotDecisionEngine(activePlayer);
    if (!botCardId) return;

    // 3. Game pacing delay loop
    const botThoughtTimer = setTimeout(() => {
      playCardAction(botCardId);
    }, 1200);

    return () => clearTimeout(botThoughtTimer);
  }, [gameState, gamePhase]);

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

  return (
    <GameEngineContext.Provider
      value={{ gameState, gamePhase, setGamePhase, playCardAction, startGame }}
    >
      {children}
    </GameEngineContext.Provider>
  );
}