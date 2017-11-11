
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Config from './config';
import Utils from './utils';

/* TERMINALS CACHE */ // Used for the `recycle` and `target` options

const cache = {}; // Mapping terminal name => terminal instance

function onTerminalClose () {
  vscode.window.onDidCloseTerminal ( term => {
    delete cache[term.name];
  });
}

onTerminalClose ();

/* ROOTS CACHE */ // Used for the `autokill` option

const cacheRoots = {}; // Mapping configPath => terminals instances

function onRootRemove () {

  vscode.workspace.onDidChangeWorkspaceFolders ( ({ removed }) => {

    removed.forEach ( async root => {

      const rootPath = root.uri.fsPath,
            config = await Config.get ( rootPath ),
            {configPath} = config;

      if ( !cacheRoots[configPath] ) return;

      if ( config.autokill ) {
        cacheRoots[configPath].forEach ( term => {
          delete cache[term.name];
          term.dispose ();
        });
        delete cacheRoots[configPath];
      }

    });

  });

}

onRootRemove ();

/* RUN */

async function run ( terminal, config? ) {

  const {name, target, command, commands, execute, recycle, shellPath, shellArgs} = terminal,
        configPath = _.get ( config, 'configPath' ) as string,
        texts = commands || [];

  if ( command ) texts.unshift ( command );

  if ( !texts.length ) return;

  const cacheTarget = target || name,
        cacheTerm = recycle !== false && cache[cacheTarget],
        isCached = !!cacheTerm,
        term = cacheTerm || vscode.window.createTerminal ( cacheTarget, shellPath, shellArgs );

  cache[cacheTarget] = term;

  if ( configPath && !isCached ) {
    if ( !cacheRoots[configPath] ) cacheRoots[configPath] = [];
    cacheRoots[configPath].push ( term );
  }

  term['__config'] = config;
  term['__terminal'] = terminal;

  await term.processId;
  await Utils.delay ( 150 );

  for ( let i = 0, l = texts.length; i < l; i++ ) {

    await Utils.delay ( 50 );

    const doExecute = execute !== false || i < l - 1; // The last of multiple commands won't be executed

    term.sendText ( texts[i], doExecute );

  }

  return term;

}

/* EXPORT */

export default run;
