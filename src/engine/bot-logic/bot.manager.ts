import {
  GameStateSnapshot,
  PlayerData,
  CardData,
  CardType, TOTAL_CARD_DISTRIBUTION
} from '../../types/game.types';
import { isTigerCardPlayMandatory } from '../utils/player.utils.ts';

export interface BotMemorySnapshot {
  knownOpponentHands: Record<string, CardType>;
}

export function calculateSmartBotGuess(
  state: GameStateSnapshot,
  botPlayer: PlayerData,
  targetOpponentId: string | null,
): CardType {
  if (!targetOpponentId) {
    return getWeightedRandomGuess(state);
  }
  const targetPlayer = state.players.find((p) => p.id === targetOpponentId);
  if (!targetPlayer) {
    return getWeightedRandomGuess(state);
  }
  let knownGuess = getBotMemoryForTarget(state, botPlayer.id, targetOpponentId );
  const allPublicDiscards = state.players.flatMap((p) => p.discardPile);

  //if the bot knows the card, double check that it can still be true
  if (knownGuess)
  {
    // Check if the target has personally discarded this card since the bot saw it.
    const targetHasPlayedIt = targetPlayer.discardPile.includes(knownGuess);
    // Double check that the card hasn't been completely exhausted globally
    const globalDiscardCount = allPublicDiscards.filter(
      (type) => type === knownGuess,
    ).length;
    const maxAllowed = TOTAL_CARD_DISTRIBUTION[knownGuess];

    if (!targetHasPlayedIt && globalDiscardCount < maxAllowed) {
      return knownGuess;
    }
  }

  return getWeightedRandomGuess(state);
}

/**
 * Evaluates a bot's current hand and returns the optimal card ID to play.
 * Prioritizes survival, strategic Peacock traps, and mechanical advantages.
 *
 * The structure of this could be further enhanced by setting up a structure that
 * could assign arbitrary point values for potential hand plays
 * on a scale
 *
 * for example:
 * 0. Suicide
 *        - playing peacock
 *        - stag beetle with meerkat in hand
 *        - playing lion to pass a meerkat to the next player
 * 1. An unknown play
 *        - early game meerkat guess with little info
 * 2. A low level play
 *        - using stag beetle with another stag beetle or chameleon in hand
 *        - using a beaver and not picking peacock at late game
 *        - playing a lion when the bot knows the card of the target is unfavorable
 * 3. A set up play
 *        - Owl play
 *        - Beaver to find a good card
 *        - chameleon with no knowledge about self
 * 4. A confident play
 *        - chameleon when opponent knows hand
 *        - stag beetle with lion or tiger
 *        - owl with meerkat in hand
 *
 * 5. Confirmed wins
 *        - stag beetle with peacock in hand
 *        - rhino targeting opponent with peacock
 *        - meerkat on known card
 *
 * each card option could come back with an arbitrary point and the bot could pick
 * the higher option, with a chance to select the lower one that greatly increases
 * the further they are apart, and avoiding 0 values at all cost
 */
export function executeBotCardSelection(
  botPlayer: PlayerData,
  state: GameStateSnapshot
): string | null {
  if (!botPlayer.hand || botPlayer.hand.length === 0) return null;

  // if forced down to 1 card, it must be played
  if (botPlayer.hand.length === 1) return botPlayer.hand[0].id;

  // mandatory tiger play
  if (isTigerCardPlayMandatory(botPlayer.hand)) {
    const tigerCard = botPlayer.hand.find(card => card.type === CardType.Tiger);
    if (tigerCard) return tigerCard.id;
  }

  // if the bot has a stag beetle and a meerkat, they should not play the stag beetle
  /*
  * Future considerations:
  * - if they know their other card is highest value in play, they should play it
  * - if they know the card of somebody else and can beat it, they should play it
  * - if the card is low, it is worth checking if the other card may be a better play
  * */
  const hasStagBeetle = botPlayer.hand.find(
    (card) => card.type === CardType.StagBeetle,
  );
  const hasMeerkat = botPlayer.hand.find(
    (card) => card.type === CardType.Meerkat,
  );
  if (hasStagBeetle && hasMeerkat)
  {
    return hasMeerkat.id;
  }

  // if the bot know it has the opportunity to make somebody discard a peacock, it should
  const hasRhino = botPlayer.hand.find(card => card.type === CardType.Rhino);
  if (hasRhino && state.botMemories && state.botMemories[botPlayer.id]) {
    const myMemory = state.botMemories[botPlayer.id];
    const targetPeacockId = Object.entries(myMemory).find(([oppId, cardType]) => {
      if (cardType !== CardType.Peacock) return false;
      const opponent = state.players.find(p => p.id === oppId);
      return opponent && !opponent.isEliminated && !opponent.isProtected;
    });

    if (targetPeacockId) {
      return hasRhino.id;
    }
  }

  // if the bot can play a meerkat and knows an opponent holds a card that isnt a meerkat, it should play it
  if (hasMeerkat && state.botMemories && state.botMemories[botPlayer.id]) {
    const myMemory = state.botMemories[botPlayer.id];
    const guaranteedKill = Object.entries(myMemory).find(([oppId, cardType]) => {
      const opponent = state.players.find(p => p.id === oppId);
      return opponent && !opponent.isEliminated && !opponent.isProtected && cardType !== CardType.Meerkat;
    });
    if (guaranteedKill) {
      return hasMeerkat.id;
    }
  }

  // avoid dropping peacock
  const survivalPool = botPlayer.hand.filter((card) => card.type !== CardType.Peacock);

  if (survivalPool.length > 0) {
    const randomSafeIndex = Math.trunc(Math.random() * survivalPool.length);
    return survivalPool[randomSafeIndex].id;
  }

  // absolute fallback
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

  // Avoid self-targeting with negative card effects unless forced
  if (isRhino) {
    const opponentTargets = validTargetIds.filter((id) => id !== botPlayer.id);
    if (opponentTargets.length > 0) {
      return opponentTargets[
        Math.floor(Math.random() * opponentTargets.length)
        ];
    }
  }

  // Pick a random opponent from the pre-filtered safe list
  const randomIndex = Math.floor(Math.random() * validTargetIds.length);
  return validTargetIds[randomIndex];
}

/**
 * Autonomous AI helper that evaluates the Beaver choice pool and returns the optimal card ID string.
 * Pure decision layer—no mutations, no turn advancement, zero circular engine calls!
 */
export function executeBotBeaverSelection(state: GameStateSnapshot): string | null {
  const choicesPool = state.cardSelectRequest;
  if (!choicesPool || choicesPool.length === 0) return null;

  const sortedOptions = [...choicesPool].sort((a, b) => b.type - a.type);
  const choice = Math.trunc(Math.random() * sortedOptions.length);
  const optimalCard = sortedOptions[choice];
  return optimalCard.id;
}



/**
 * Smart deduction sweep that updates bot memories when a player plays a card.
 * If a player plays a card that a bot was remembering, the bot evaluates if it's
 * mathematically possible for them to still hold a duplicate of that exact card.
 */
export function auditBotMemoriesOnCardPlay(state: GameStateSnapshot, playerWhoPlayed: PlayerData, playedCardType: CardType): void {
  const allPublicDiscards = state.players.flatMap((p) => p.discardPile);

  // Look at total copies allowed for this card type from your global dictionary registry
  const maxAllowedCopies = TOTAL_CARD_DISTRIBUTION[playedCardType];
  const totalDiscardedPublicly = allPublicDiscards.filter(type => type === playedCardType).length;

  // Check how many copies are sitting hidden in the deck or secret burn pile
  const missingUnseenCopies = maxAllowedCopies - totalDiscardedPublicly;

  const safeBotMemories = state.botMemories || {};
  // Sweep through every bot's brain log registers
  Object.keys(safeBotMemories).forEach((botId) => {
    const botMemory = state.botMemories[botId];

    // Check if this specific bot was tracking the playing player's hand
    if (botMemory[playerWhoPlayed.id] !== undefined) {
      const cardBotRemembered = botMemory[playerWhoPlayed.id];

      // Condition: The player just played the card the bot was remembering
      if (cardBotRemembered === playedCardType) {
        if (missingUnseenCopies !== 0) {
          delete state.botMemories[botId][playerWhoPlayed.id];
        }
      }
    }
  });
}


/**
 * Generates a statistically weighted guess based on remaining card pool distribution.
 */
function getWeightedRandomGuess(state: GameStateSnapshot): CardType {
  const allPublicDiscards = state.players.flatMap((p) => p.discardPile);

  // Base legal options (Excluding Meerkat itself)
  const baseGuessOptions = Object.keys(CardType)
    .map((key) => Number(key))
    .filter((value) => !isNaN(value) && value !== CardType.Meerkat);

  const weightedPool: CardType[] = [];

  baseGuessOptions.forEach((typeCode) => {
    const cardType = typeCode as CardType;
    const discardCount = allPublicDiscards.filter(type => type === cardType).length;
    const maxAllowed = TOTAL_CARD_DISTRIBUTION[cardType];

    const remainingCopies = maxAllowed - discardCount;

    for (let i = 0; i < remainingCopies; i++) {
      weightedPool.push(cardType);
    }
  });

  if (weightedPool.length > 0) {
    return weightedPool[Math.floor(Math.random() * weightedPool.length)];
  }

  return CardType.Owl; // Absolute fallback default
}

function getBotMemoryForTarget(gameState: GameStateSnapshot, botPlayerId: string, targetPlayerId: string): CardType | null
{
  let guess = null;
  if (
    gameState.botMemories &&
    Object.keys(gameState.botMemories).length > 0
  ) {

    Object.entries(gameState.botMemories).forEach(([botId, memories]) => {
      if (botId === botPlayerId) {
        Object.entries(memories).forEach(([opponentId, card]) => {
          if (opponentId === targetPlayerId) {
            if (card !== null) {
              guess = card;
            }
          }
        });
      }
    });
  }
  return guess;
}
