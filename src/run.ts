
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Utils from './utils';

/* RUN */

async function run ({ name, shellPath, shellArgs, execute, command, commands }) {

  commands = _.isArray ( commands ) ? commands : [];

  if ( command ) commands.unshift ( command );

  if ( !commands.length ) return;

  const term = vscode.window.createTerminal ( name, shellPath, shellArgs );

  await term.processId;
  await Utils.delay ( 150 );

  for ( let i = 0, l = commands.length; i < l; i++ ) {

    await Utils.delay ( 50 );

    const doExecute = execute !== false || i < l - 1; // The last of multiple commands won't be executed

    term.sendText ( commands[i], doExecute );

  }

  return term;

}

/* EXPORT */

export default run;
