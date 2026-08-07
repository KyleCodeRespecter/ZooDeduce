import {
  GameStateSnapshot,
  PlayerData,
  CardData,
  CardType,
} from '../../types/game.types';

/**
 * Evaluates a bot's current hand and returns the optimal card ID to play.
 * Prioritizes survival by avoiding the Peacock at all costs.
 */
export function executeBotCardSelection(botPlayer: PlayerData): string | null {
  if (!botPlayer.hand || botPlayer.hand.length === 0) {
    return null;
  }

  // If forced down to 1 card, it must be played
  if (botPlayer.hand.length === 1) {
    return botPlayer.hand[0].id;
  }

  // Strategy Gate: Filter out the suicidal Peacock card
  const survivalPool = botPlayer.hand.filter(
    (card) => card.type !== CardType.Peacock,
  );

  if (survivalPool.length > 0) {
    return survivalPool[0].id; // Play the first safe card available
  }

  // Absolute fallback: If holding two Peacocks, it is forced to drop one
  return botPlayer.hand[0].id;
}

/**
 * Selects an intelligent target ID for a bot from a pre-filtered list of legal options.
 */
export function selectOptimalBotTarget(
  state: GameStateSnapshot,
  botPlayer: PlayerData,
  validTargetIds: string[],
  playedCard: CardData,
): string | null {
  if (validTargetIds.length === 0) return null;

  const isRhino = playedCard.type === CardType.Rhino;

  // Rhino Optimization Rule: Avoid self-targeting with negative card effects unless forced
  if (isRhino) {
    const opponentTargets = validTargetIds.filter((id) => id !== botPlayer.id);
    if (opponentTargets.length > 0) {
      return opponentTargets[
        Math.floor(Math.random() * opponentTargets.length)
        ];
    }
  }

  // Standard Target Selection: Pick a random opponent from the pre-filtered safe list
  const randomIndex = Math.floor(Math.random() * validTargetIds.length);
  return validTargetIds[randomIndex];
}
