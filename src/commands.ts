
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import vscode from 'vscode';
import {alert, openInEditor, prompt} from 'vscode-extras';
import {DEFAULT_CONFIG} from './constants';
import {INSTANCE_TO_WORKSPACE, ID_TO_INSTANCE} from './runner';
import Runner from './runner';
import {getConfigPath, getGroups, getGroupsFromExternalConfig, getGroupsQuickPickItems} from './utils';
import type {Terminal, TerminalQuickPickItem} from './types';

/* HELPERS */

const minimatch = ( pattern: string, filePath: string ): boolean => {
  // Simple glob pattern matching
  // Normalize path separators to forward slashes for consistent matching
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\\/g, '/') // Normalize pattern separators too
    .replace(/\./g, '\\.') // Escape dots
    .replace(/\*\*/g, '\x00GLOBSTAR\x00') // Temporarily replace ** with unlikely sequence
    .replace(/\*/g, '[^/]*') // * matches anything except /
    .replace(/\x00GLOBSTAR\x00/g, '.*') // ** matches anything including /
    .replace(/\?/g, '.'); // ? matches single character
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(normalizedPath);
};

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

const autoswitchTerminalByFile = async ( filePath: string | undefined ): Promise<void> => {

  if ( !filePath ) return;

  const groups = getGroups ();
  
  // Find all terminals with autoswitch patterns
  const terminals = groups.flatMap ( group => group.terminals );
  
  // Find the first terminal with a matching autoswitch pattern
  for ( const terminal of terminals ) {
    
    if ( !terminal.autoswitch ) continue;
    
    // Check if the file path matches the autoswitch pattern
    if ( minimatch ( terminal.autoswitch, filePath ) ) {
      
      // Check if the terminal is already running
      const instance = ID_TO_INSTANCE.get ( terminal.name );
      
      if ( instance ) {
        
        // Switch to the terminal (show it without focusing)
        // instance.show(preserveFocus: true) - shows terminal but keeps editor focus
        instance.show ( true );
        break; // Only switch to the first matching terminal
        
      }
      
    }
    
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

export {autorunTerminalsByWorkspace, autokillTerminalsByWorkspace, autoswitchTerminalByFile};
export {editConfig, initConfig};
export {kill};
export {runTerminal, runTerminalByName, runTerminals, runTerminalsItems};
