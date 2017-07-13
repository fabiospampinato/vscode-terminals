
/* IMPORT */

import {runTerminals} from './commands';
import Config from './config';
import Utils from './utils';

/* ACTIVATE */

async function activate () {

  Utils.initCommands ();

  const config = await Config.get ();

  if ( config.autorun ) runTerminals ();

}

/* EXPORT */

export {activate};
