import React, { useEffect, useState } from 'react';
import { GameEngineContext } from './game.engine.context.ts';
import { CardType, GamePhase, GameStateSnapshot } from '../types/game.types.ts';
import { initializeMatch } from './game.manager.ts';
import { gameLogger} from '../ultils/logger/logger.ts';


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

  const startGame = (opponentCount: number) => {
    // Generate the player array dynamically based on the input number
    const playerNames = [
      'HumanPlayer',
      ...Array.from(
        { length: opponentCount },
        (_, i) => `Bot_${i + 1}`,
      ),
    ];

    // Initialize the engine match data structure
    const initialSnapshot = initializeMatch(playerNames);

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