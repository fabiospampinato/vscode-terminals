
/* IMPORT */

import * as vscode from 'vscode';
import {runTerminals} from './commands';
import Config from './config';
import Utils from './utils';

/* ACTIVATE */

async function activate ( context: vscode.ExtensionContext ) {

  Utils.initCommands ( context );

  const config = await Config.get ();

  if ( config.autorun ) runTerminals ();

}

/* EXPORT */

export {activate};
