
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Utils from './utils';

/* CACHE */

const cache = {};

function onClose () {
  vscode.window.onDidCloseTerminal ( term => delete cache[term.name] );
}

onClose ();

/* RUN */

async function run ( config ) {

  let {name, target, command, commands, execute, recycle, shellPath, shellArgs} = config;

  commands = _.isArray ( commands ) ? commands : [];

  if ( command ) commands.unshift ( command );

  if ( !commands.length ) return;

  const cacheTarget = target || name,
        cacheTerm = recycle !== false && cache[cacheTarget],
        term = cacheTerm || vscode.window.createTerminal ( cacheTarget, shellPath, shellArgs );

  cache[cacheTarget] = term;

  term['__config'] = config;

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
