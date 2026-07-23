import { GamePhase } from '../../types/game.types';
import { LOG_STYLES } from './logger.themes';
import { environmentGuard } from './logger.guard';

function rawEngineTick (gamePhase: GamePhase) {
  console.group(`%c[Zoo Deduce]%c Phase: ${gamePhase}`,
    LOG_STYLES.engineTick,
    LOG_STYLES.subText
  );
}

function rawCloseGroup (){
  console.group();
}

function rawSystemAlert (message: string) {
  console.log(`%c[ALERT]%c ${message}`,
    LOG_STYLES.systemAlert,
    LOG_STYLES.subText);
}

function rawPlayerAction ( player: string, message: string) {
    console.log(
      `%c[PLAYER ACTION] %c${player} %c${message}`,
      LOG_STYLES.playerAction,
      LOG_STYLES.playerNameBadge,
      LOG_STYLES.subText,
    );
}

function rawGeneralText (...messageData: any[]) {
  if (typeof messageData[0] === 'string') {
    console.log(
      `%c${messageData[0]}`,
      LOG_STYLES.generalText,
      ...messageData.slice(1),
    );
  } else {
    // If it's a raw object or array, just forward it natively
    console.log(...messageData);
  }
}


export const gameLogger =
  {
    logEngineTick: environmentGuard(rawEngineTick),
    closeGroup: environmentGuard(rawCloseGroup),
    logSystemAlert: environmentGuard(rawSystemAlert),
    logPlayerAction: environmentGuard(rawPlayerAction),
    log: environmentGuard(rawGeneralText)
  }