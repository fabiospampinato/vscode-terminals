
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Config from './config';
import run from './run';
import Substitutions from './substitutions';
import Utils from './utils';

/* COMMANDS */

async function runTerminals ( rootPath?: string, substitutions? ) {

  const config = await Config.get ( rootPath ),
        terminals = config.terminals.filter ( terminal => terminal.onlyAPI !== true && terminal.onlySingle !== true );

  if ( !terminals.length ) vscode.window.showErrorMessage ( 'No terminals defined, edit the configuration' );

  substitutions = substitutions || Substitutions.get ();

  const terms = await Promise.all ( terminals.map ( terminal => run ( terminal, config, rootPath, substitutions ) ) ),
        term = terms.find ( ({ __terminal }) => __terminal.open || __terminal.focus  ) as vscode.Terminal;

  if ( !term ) return;

  term.show ( !term['__terminal'].focus );

}

async function runTerminal () {

  const config = await Config.get (),
        terminals = config.terminals.filter ( terminal => terminal.onlyAPI !== true && terminal.onlyMultiple !== true );

  if ( !terminals.length ) return vscode.window.showErrorMessage ( 'No terminals defined, edit the configuration' );

  const {items} = Utils.ui.makeItems ( config, {terminals}, Utils.ui.makeQuickPickItem ),
        selected = await vscode.window.showQuickPick ( items, { placeHolder: 'Select a terminal...' } );

  if ( !selected ) return;

  runTerminalByName ( selected.obj.name );

}

async function runTerminalByName ( name ) {

  const config = await Config.get (),
        terminal = config.terminals.find ( terminal => terminal.name === name );

  if ( !terminal ) return;

  const term = await run ( terminal, config );

  if ( !terminal.open && !terminal.focus ) return;

  term.show ( !terminal.focus );

}

async function initConfig () {

  const config = await Config.get ();
  const defaultConfig = {
    autorun: false,
    terminals: [{
      name: 'Single',
      description: 'This is a description',
      focus: true,
      command: 'echo "Hello World"'
    }, {
      name: 'Multi',
      commands: [
        'echo "Did you know?"',
        'echo "You can execute multiple commands"'
      ]
    }, {
      name: 'Single - No execution',
      execute: false,
      command: 'Press enter to run me',
    }, {
      name: 'Multi - No execution',
      execute: false,
      commands: [
        'echo "Only the last command won\'t be executed"',
        'Press enter to run me'
      ]
    }, {
      name: 'Persistent',
      focus: true,
      onlySingle: true,
      persistent: 'demo_persistent',
      command: 'echo "I\'m persistent! Try to reload the window and re-execute this command"'
    }, {
      name: 'Variable Substitution',
      description: 'Many special strings can be substituted dynamically',
      command: "echo \"workspaceFolder: [workspaceFolder]\\nworkspaceFolderBasename: [workspaceFolderBasename]\\nfile: [file]\\nrelativeFile: [relativeFile]\\nfileBasename: [fileBasename]\\nfileBasenameNoExtension: [fileBasenameNoExtension]\\nfileDirname: [fileDirname]\\nfileExtname: [fileExtname]\\ncwd: [cwd]\\nlineNumber: [lineNumber]\""
    }, {
      name: 'Only Single',
      open: true,
      onlySingle: true,
      command: 'echo "I will not run with the others"'
    }]
  };
  const content = JSON.stringify ( defaultConfig, undefined, 2 );

  return Utils.file.make ( config.configPath, content );

}

async function editConfig () {

  const rootPath = Utils.folder.getActiveRootPath ();

  if ( !rootPath ) return vscode.window.showErrorMessage ( 'You have to open a project before being able to edit its configuration' );

  const config = await Config.get (),
        hasFile = !!( await Utils.file.read ( config.configPath ) );

  if ( !hasFile ) await initConfig ();

  return Utils.file.open ( config.configPath );

}

async function kill () {

  for ( let i = 0, l = 25; i < l; i++ ) {

    vscode.commands.executeCommand ( 'workbench.action.terminal.kill' );

  }

}

/* EXPORT */

export {runTerminals, runTerminal, runTerminalByName, initConfig, editConfig, kill};
