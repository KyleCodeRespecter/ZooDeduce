import { PlayerData } from '../../types/game.types.ts';

export function executeBotDecisionEngine(botPlayer: PlayerData) {
  if (botPlayer.hand.length === 0) {
    return null;
  }

  // Basic Rule: Pick the first available card in hand
  const chosenCard = botPlayer.hand[0];
  return chosenCard.id;
}