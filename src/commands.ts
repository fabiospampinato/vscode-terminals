
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import vscode from 'vscode';
import {alert, openInEditor, prompt} from 'vscode-extras';
import {DEFAULT_CONFIG} from './constants';
import {INSTANCE_TO_WORKSPACE} from './runner';
import Runner from './runner';
import {getConfigPath, getGroups, getGroupsFromExternalConfig, getGroupsQuickPickItems} from './utils';
import type {Terminal, TerminalQuickPickItem} from './types';

/* MAIN */

const autorunTerminalsByWorkspace = async ( workspacePath: string ): Promise<void> => {

  const groups = getGroupsFromExternalConfig ( workspacePath );
  const filterer = ( terminal: Terminal ): boolean => terminal.autorun && !terminal.onlyAPI && !terminal.onlySingle;
  const items = getGroupsQuickPickItems ( groups, filterer );

  if ( !items.length ) return;

  runTerminalsItems ( items );

};

const autokillTerminalsByWorkspace = async ( workspacePath: string ): Promise<void> => {

  for ( const [instance, workspace] of INSTANCE_TO_WORKSPACE ) {

    if ( workspace !== workspacePath ) continue;

    Runner.unrun ( instance );

  }

};

const editConfig = (): void => {

  const configPath = getConfigPath ();

  if ( !configPath ) return alert.error ( 'You have to open a project before being able to edit its configuration' );

  const hasConfigFile = fs.existsSync ( configPath );

  if ( hasConfigFile ) { // Open

    openInEditor ( configPath );

  } else { // Init + Open

    initConfig ();
    openInEditor ( configPath );

  }

};

const initConfig = (): void => {

  const configPath = getConfigPath ();

  if ( !configPath ) return alert.error ( 'You have to open a project before being able to initialize its configuration' );

  const config = JSON.stringify ( DEFAULT_CONFIG, null, 2 );

  fs.mkdirSync ( path.dirname ( configPath ), { recursive: true } );
  fs.writeFileSync ( configPath, config );

};

const kill = (): void => {

  for ( let i = 0, l = 25; i < l; i++ ) {

    vscode.commands.executeCommand ( 'workbench.action.terminal.kill' );

  }

};

const runTerminal = async (): Promise<void> => {

  const groups = getGroups ();
  const filterer = ( terminal: Terminal ): boolean => !terminal.onlyAPI && !terminal.onlyMultiple;
  const items = getGroupsQuickPickItems ( groups, filterer );

  if ( !items.length ) return alert.error ( 'No terminals defined, edit the configuration' );

  const item = await prompt.select ( 'Select a terminal...', items );

  if ( !item ) return;

  runTerminalsItems ([ item ]);

};

const runTerminalByName = async ( name: string ): Promise<void> => {

  const groups = getGroups ();
  const filterer = ( terminal: Terminal ): boolean => terminal.name === name;
  const items = getGroupsQuickPickItems ( groups, filterer );

  if ( !items.length ) return alert.error ( `No terminal found with the name: "${name}"` );

  runTerminalsItems ([ items[0] ]);

};

const runTerminals = async (): Promise<void> => {

  const groups = getGroups ();
  const filterer = ( terminal: Terminal ): boolean => !terminal.onlyAPI && !terminal.onlySingle;
  const items = getGroupsQuickPickItems ( groups, filterer );

  if ( !items.length ) return alert.error ( 'No terminals defined, edit the configuration' );

  runTerminalsItems ( items );

};

const runTerminalsItems = async ( items: TerminalQuickPickItem[] ): Promise<void> => {

  const terminals = items.map ( item => item.terminal );
  const instances = await Promise.all ( terminals.map ( Runner.run ) );
  const terminalIndex = terminals.findIndex ( terminal => terminal.open || terminal.focus );

  if ( terminalIndex < 0 ) return;

  const terminal = terminals[terminalIndex];
  const instance = instances[terminalIndex];

  if ( !terminal || !instance ) return;

  instance.show ( !terminal.focus );

};

/* EXPORT */

export {autorunTerminalsByWorkspace, autokillTerminalsByWorkspace};
export {editConfig, initConfig};
export {kill};
export {runTerminal, runTerminalByName, runTerminals, runTerminalsItems};
