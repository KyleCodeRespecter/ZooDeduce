import { CardType } from '../types/card.types';

export type LogEventType =
  'GAME_START' | 'ELIMINATION' | 'ROUND_COMPLETE' | `${CardType}_PLAY`;

export interface MatchLogEntry {
  eventType: LogEventType;
  actorName?: string;
  actorIndex?: number;
  cardType?: CardType;
  targetName?: string; // Optional target recipient
  targetIndex?: number;
  extraDetails?: string; // specialized text parameters like Meerkat guesses
}

/*Formats messages based on a MatchLogEntry, returning an array of text objects
* which can include information of whether the text is an actor or a target
* */
export function formatLogMessage(
  entry: MatchLogEntry
): Array<{ text: string; isActor?: boolean; isTarget?: boolean }> {

  const actorSeg = { text: entry.actorName || 'Unknown', isActor: true };
  const targetSeg = entry.targetName ? { text: entry.targetName, isTarget: true } : { text: 'Nobody' };

  switch (entry.cardType) {
    case CardType.Meerkat:
      return [
        actorSeg,
        { text: ' initiated a Meerkat guess targeting ' },
        targetSeg,
        { text: `, guessing [${entry.extraDetails || 'Unknown'}].` }
      ];

    case CardType.Owl:
      return [
        actorSeg,
        { text: " used an Owl to peek at " },
        targetSeg,
        { text: "'s hand." }
      ];

    case CardType.Beaver:
      return [actorSeg, { text: ' played a Beaver.' }];

    case CardType.Chameleon:
      return [actorSeg, { text: ' played a Chameleon.' }];

    case CardType.StagBeetle:
      return [actorSeg, { text: ' played a Stag Beetle on ' }, targetSeg, { text: '.' }];

    case CardType.Rhino:
      return [actorSeg, { text: ' played a Rhino on ' }, targetSeg, { text: '.' }];

    case CardType.Lion:
      return [actorSeg, { text: ' played a Lion on ' }, targetSeg, { text: '.' }];

    case CardType.Tiger:
      return [actorSeg, { text: ' played a Tiger.' }];

    case CardType.Peacock:
      return [actorSeg, { text: ' played a Peacock.' }];

    default:
      if (entry.eventType === 'GAME_START') {
        return [{ text: 'Round has started' }];
      }
      if (entry.eventType === 'ELIMINATION') {
        return [{ text: '❌ ' }, actorSeg, { text: ' has been eliminated!' }];
      }
      if (entry.eventType === 'ROUND_COMPLETE') {
        return [{ text: 'Round has ended' }];
      }
      return [{ text: `[SYSTEM EVENT]: ${entry.actorName} registered status [${entry.eventType}].` }];
  }
}



