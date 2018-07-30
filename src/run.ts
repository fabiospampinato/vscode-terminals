
/* IMPORT */

import * as _ from 'lodash';
import * as path from 'path';
import * as untildify from 'untildify';
import * as vscode from 'vscode';
import Config from './config';
import Substitutions from './substitutions';
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

async function run ( terminal, config, rootPath?, substitutions? ) {

  rootPath = rootPath || Utils.folder.getActiveRootPath ();

  const { name, target, cwd: terminalCwd, command, commands, execute, persistent, recycle, substitution, shellPath, env: terminalEnv, envInherit } = terminal,
        configPath = _.get ( config, 'configPath' ) as string,
        configEnv = _.get ( config, 'env' );

  let {shellArgs} = terminal,
      cwd = terminalCwd || rootPath,
      texts = commands || [],
      env = envInherit !== false ? _.merge ( {}, configEnv, terminalEnv ) : terminalEnv;

  if ( command ) texts.unshift ( command );

  if ( !texts.length ) return;

  if ( substitution !== false ) {

    substitutions = substitutions || Substitutions.get ();

    shellArgs = Substitutions.apply ( cwd, substitutions );
    cwd = Substitutions.apply ( cwd, substitutions );
    texts = Substitutions.apply ( texts, substitutions );
    env = Substitutions.apply ( env, substitutions );

  }

  if ( cwd ) {

    cwd = path.resolve ( rootPath, untildify ( cwd ) );

  }

  if ( persistent ) {

    const reattach = Utils.multiplexer.reattach ( config.multiplexer, persistent );

    texts.unshift ( reattach );

  }

  const cacheTarget = target || name,
        cacheTerm = recycle !== false && cache[cacheTarget],
        isCached = !!cacheTerm,
        term = cacheTerm || vscode.window.createTerminal ({ cwd, env, name: cacheTarget, shellPath, shellArgs });

  cache[cacheTarget] = term;

  if ( configPath && !isCached ) {
    if ( !cacheRoots[configPath] ) cacheRoots[configPath] = [];
    cacheRoots[configPath].push ( term );
  }

  term['__config'] = config;
  term['__terminal'] = terminal;

  await term.processId;
  await Utils.delay ( 150 );

  if ( persistent ) term.show ( false );

  for ( let i = 0, l = texts.length; i < l; i++ ) {

    if ( persistent && i === 1 ) await Utils.delay ( 1500 ); // It may take a while to start the multiplexer

    await Utils.delay ( 50 );

    const doExecute = execute !== false || i < l - 1; // The last of multiple commands won't be executed

    term.sendText ( texts[i], doExecute );

  }

  return term;

}

/* EXPORT */

export default run;
