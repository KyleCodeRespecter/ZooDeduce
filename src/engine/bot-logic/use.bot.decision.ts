import { useEffect } from 'react';
import { GamePhase, GameStateSnapshot } from '../../types/game.types.ts';
import { gameLogger } from '../../ultils/logger/logger.ts';
import { executeBotCardSelection } from './bot.manager.ts';


interface UseBotBrainProps {
  gamePhase: GamePhase;
  gameState: GameStateSnapshot | null;
  playCardAction: (cardId: string) => void;
}

export function useBotBrain({
  gamePhase,
  gameState,
  playCardAction,
}: UseBotBrainProps) {
  useEffect(() => {
    if (gamePhase !== GamePhase.Gameplay || !gameState) {
      return;
    }

    const activePlayer = gameState.players[gameState.currentPlayerIndex];

    if (!activePlayer.isBot || activePlayer.isEliminated) {
      return;
    }

    const targetedCardId = executeBotCardSelection(activePlayer);
    if (!targetedCardId) {
      return;
    }

    // Handle game pacing delay
    const botThoughtTimer = setTimeout(() => {
      gameLogger.log(
        `[BOT ACTION]: ${activePlayer.name} is committing card play.`,
      );
      playCardAction(targetedCardId);
    }, 2400);

    return () => clearTimeout(botThoughtTimer);
  }, [gameState, gamePhase, playCardAction]);
}
