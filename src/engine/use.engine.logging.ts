// src/engine/hooks/useEngineLogging.ts
import { useEffect } from 'react';
import {
  GamePhase,
  GameStateSnapshot,
  CardType,
} from '../types/game.types.ts';
import { gameLogger } from '../ultils/logger/logger.ts';

export function useEngineLogging(
  gamePhase: GamePhase,
  gameState: GameStateSnapshot | null,
  setGamePhase: (phase: GamePhase) => void,
) {
  useEffect(() => {
    if (gamePhase !== GamePhase.Gameplay || !gameState) {
      return;
    }

    if (!gameState.burnedCards) {
      gameLogger.logSystemAlert(
        'CRITICAL SUBSYSTEM ANOMALY: burnCards data structure is NULL. ' +
          'Halting current game loop and forcing automatic subsystem reset.',
      );
      setGamePhase(GamePhase.MainMenu);
      return;
    }

    gameLogger.logEngineTick(gamePhase);
    gameLogger.log('Current Active Deck Size:', gameState.deck.length);
    gameLogger.log(
      'Burned Cards Active Seed:',
      gameState.burnedCards
        .map((card) => `${CardType[card.type]} (${card.type})`)
        .join(', '),
    );
    gameLogger.log(
      'Current Active Player Index Reference:',
      gameState.currentPlayerIndex,
    );

    console.table(
      gameState.players.map((player) => ({
        Name: player.name,
        Bot: player.isBot ? '🤖 YES' : '👤 NO',
        CardsInHand: player.hand.map((card) => CardType[card.type]).join(', '),
        DiscardPileHistory: player.discardPile
          .map((type) => CardType[type])
          .join(', '),
        IsEliminated: player.isEliminated,
        IsProtected: player.isProtected,
      })),
    );

    gameLogger.closeGroup();
  }, [gameState, gamePhase, setGamePhase]);
}
