import { CardType } from '../types/card.types';

export type LogEventType =
  'GAME_START' | 'ELIMINATION' | 'ROUND_COMPLETE' | `${CardType}_PLAY`;

export interface MatchLogEntry {
  eventType: LogEventType;
  actorName?: string;
  cardType?: CardType;
  targetName?: string; // Optional target recipient
  extraDetails?: string; // specialized text parameters like Meerkat guesses
}

export function formatLogMessage(entry: MatchLogEntry): string {
  switch (entry.cardType) {
    case CardType.Meerkat:
      return `${entry.actorName} initiated a Meerkat guess targeting ${entry.targetName || 'Unknown'}, guessing [${entry.extraDetails || 'Unknown'}].`;

    case CardType.Owl:
      return `${entry.actorName} used an Owl to peek at ${entry.targetName || 'Unknown'}'s hand.`;

    case CardType.Beaver:
      return `${entry.actorName} played a Beaver.`;

    case CardType.Chameleon:
      return `${entry.actorName} played a Chameleon.`;

    case CardType.StagBeetle:
      return `${entry.actorName} played a Stag Beetle on ${entry.targetName || 'Unknown'}.`;

    case CardType.Rhino:
      return `${entry.actorName} played a Rhino on ${entry.targetName || 'Unknown'}.`;

    case CardType.Lion:
      return `${entry.actorName} played a Lion on ${entry.targetName || 'Unknown'}.`;

    case CardType.Tiger:
      return `${entry.actorName} played a Tiger.`;

    case CardType.Peacock:
      return `${entry.actorName} played a Peacock.`;

    default:
      if (entry.eventType === 'GAME_START')
      {
        return 'Round has started';
      }
      if (entry.eventType === 'ELIMINATION') {
        return `❌ ${entry.actorName} has been eliminated!`;
      }
      if (entry.eventType === 'ROUND_COMPLETE') {
        return `Round has ended`;
      }
      return `[SYSTEM EVENT]: ${entry.actorName} registered action data status [${entry.eventType}].`;
  }
}

