
/* IMPORT */

import vscode from 'vscode';
import {delay, getTerminalByName, isUndefined} from './utils';
import type {Terminal} from './types';

/* HELPERS */

const ID_TO_INSTANCE = new Map<string, vscode.Terminal>();
const INSTANCE_TO_ID = new Map<vscode.Terminal, string>();
const INSTANCE_TO_WORKSPACE = new Map<vscode.Terminal, string | undefined>();

/* MAIN */

const Runner = {

  run: async ( terminal: Terminal ): Promise<vscode.Terminal> => {

    const {name, icon, color} = terminal;
    const {workspace, cwd, commands} = terminal;
    const {target, split, persistent, recycle, execute, dynamicTitle} = terminal;
    const {env, shellPath, shellArgs} = terminal;

    const cacheKey = target || name;
    const cacheTerm = recycle && ID_TO_INSTANCE.get ( cacheKey ) || getTerminalByName ( cacheKey );
    const cacheParentTerm = split && ID_TO_INSTANCE.get ( split );
    const location = cacheParentTerm ? { parentTerminal: cacheParentTerm } : undefined;
    const title = dynamicTitle ? undefined : cacheKey;
    const colorPath = color ? new vscode.ThemeColor ( color ) : undefined;
    const iconPath = icon ? new vscode.ThemeIcon ( icon ) : undefined;

    const options: vscode.TerminalOptions = { cwd, env, name: title, color: colorPath, iconPath, isTransient: true, shellPath, shellArgs, location };
    const instance = cacheTerm || vscode.window.createTerminal ( options );

    ID_TO_INSTANCE.set ( cacheKey, instance );
    INSTANCE_TO_ID.set ( instance, cacheKey );
    INSTANCE_TO_WORKSPACE.set ( instance, workspace );

    await instance.processId;
    await delay ( 150 );

    if ( persistent ) {

      instance.show ( false );

    }

    for ( let i = 0, l = commands.length; i < l; i++ ) {

      if ( persistent && i === 1 ) { // It may take a while to start the multiplexer

        await delay ( 1500 );

      } else { // Not a multiplexer command, probably

        await delay ( 50 );

      }

      const command = commands[i];
      const shouldExecute = execute || ( i < l - 1 ); // Only the last of multiple commands won't be executed

      instance.sendText ( command, shouldExecute );

    }

    return instance;

  },

  unrun: async ( instance: vscode.Terminal ): Promise<void> => {

    if ( isUndefined ( instance.exitStatus ) ) { // Still running, killing it

      instance.dispose ();

    }

    const id = INSTANCE_TO_ID.get ( instance );

    if ( !isUndefined ( id ) ) { // Known instance, cleaning up

      ID_TO_INSTANCE.delete ( id );
      INSTANCE_TO_ID.delete ( instance );
      INSTANCE_TO_WORKSPACE.delete ( instance );

    }

  }

};

/* EXPORT */

export {ID_TO_INSTANCE, INSTANCE_TO_ID, INSTANCE_TO_WORKSPACE};
export default Runner;
