import { useEffect } from 'react';
import { GamePhase, GameStateSnapshot, CardType } from '../types/game.types.ts';
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
    // skip ticks where a human ui is overlayed
    if (gameState.activeTargetRequest || gameState.targetPeekRequest || gameState.cardSelectRequest)
    {
      return;
    }

    if (!gameState.burnedCards) {
      gameLogger.logSystemAlert(
        'CRITICAL SUBSYSTEM ANOMALY: burnCards data structure is NULL.',
      );
      setGamePhase(GamePhase.MainMenu);
      return;
    }

    console.group(
      `[ENGINE TICK] Phase: ${gamePhase} | Active Player Index: ${gameState.currentPlayerIndex}`,
    );

    gameLogger.log('Current Active Deck Size:', gameState.deck.length);
    gameLogger.log(
      'Current Active Player Index Reference:',
      gameState.currentPlayerIndex,
    );

    // 1. Core Player Snapshot Telemetry Grid
    console.table(
      gameState.players.map((player, idx) => ({
        Index: idx,
        Name: player.name,
        Id: player.id,
        Active: idx === gameState.currentPlayerIndex ? '👉 ACTIVE' : '',
        Bot: player.isBot ? '🤖 YES' : '👤 NO',
        CardsInHand: player.hand.map((card) => CardType[card.type]).join(', '),
        DiscardPileHistory: player.discardPile
          .map((type) => CardType[type])
          .join(', '),
        IsEliminated: player.isEliminated,
        IsProtected: player.isProtected,
      })),
    );

    if (
      gameState.botMemories &&
      Object.keys(gameState.botMemories).length > 0
    ) {
      const memoryTableData: Record<string, any> = {};

      Object.entries(gameState.botMemories).forEach(([botId, memories]) => {
        const botName =
          gameState.players.find((p) => p.id === botId)?.name ||
          `Bot_${botId.slice(0, 4)}`;
        memoryTableData[botName] = {};

        Object.entries(memories).forEach(([opponentId, cardEnumCode]) => {
          const opponentName =
            gameState.players.find((p) => p.id === opponentId)?.name ||
            `Player_${opponentId.slice(0, 4)}`;
          memoryTableData[botName][opponentName] =
            `${CardType[cardEnumCode]} (${cardEnumCode})`;
        });
      });

      console.log(
        `%c[AI INTEL MEMORY INDEX MATRIX]`,
        'color: #00cccc; font-weight: 800; text-transform: uppercase; font-size: 11px;',
      );
      console.table(memoryTableData);
    } else {
      console.log(
        '%c[AI MEMORY STATUS]: No active tracking logs stored in bot memory registries.',
        'color: #888888; font-style: italic;',
      );
    }

    console.groupEnd();
  }, [gameState, gamePhase, setGamePhase]);
}
