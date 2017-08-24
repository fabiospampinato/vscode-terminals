
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Config from './config';
import run from './run';
import Utils from './utils';

/* COMMANDS */

async function runTerminals () {

  const config = await Config.get (),
        terminals = config.terminals.filter ( terminal => terminal.onlyAPI !== true && terminal.onlySingle !== true );

  if ( !terminals.length ) vscode.window.showErrorMessage ( 'No terminals defined, edit the configuration' );

  const terms = await Promise.all ( terminals.map ( run ) ),
        openTermIndex = terminals.findIndex ( ({ open, focus }) => open || focus );

  if ( openTermIndex >= 0 ) {

    const openTerm = terms[openTermIndex] as vscode.Terminal,
          openConfig = terminals[openTermIndex];

    openTerm.show ( !openConfig.focus );

  }

}

async function runTerminal () {

  const config = await Config.get (),
        terminals = config.terminals.filter ( terminal => terminal.onlyAPI !== true && terminal.onlyMultiple !== true );

  if ( !terminals.length ) return vscode.window.showErrorMessage ( 'No terminals defined, edit the configuration' );

  const items = terminals.map ( ({ name, icon }) => icon ? `$(${icon}) ${name}` : name );

  const selected = vscode.window.showQuickPick ( items, { placeHolder: 'Select a terminal...' } );

  selected.then ( async selectedName => {

    if ( !selectedName ) return;

    const parts = selectedName.match ( /\$\((\S+)\) (.*)/ ),
          name = parts ? parts[2] : selectedName;

    const terminal = terminals.find ( terminal => terminal.name === name );

    if ( !terminal ) return;

    const term = await run ( terminal );

    if ( !terminal.open && !terminal.focus ) return;

    term.show ( !terminal.focus );

  });

}

async function initConfig () {

  const config = await Config.get ();
  const defaultConfig = {
    autorun: false,
    terminals: [{
      name: 'Single',
      focus: true,
      command: "echo 'Hello World!'"
    }, {
      name: 'Multi',
      commands: [
        "echo 'Did you know?'",
        "echo 'You can execute multiple commands!'"
      ]
    }, {
      name: 'Single - No execution',
      execute: false,
      command: "Press enter to run me",
    }, {
      name: 'Multi - No execution',
      execute: false,
      commands: [
        "echo 'Only the last command won't be executed'",
        "Press enter to run me"
      ]
    }, {
      name: "Only Single",
      open: true,
      onlySingle: true,
      command: "echo 'I will not run with the others'"
    }]
  };
  const content = JSON.stringify ( defaultConfig, undefined, 2 );

  return Utils.file.make ( config.configPath, content );

}

async function editConfig () {

  const {rootPath} = vscode.workspace;

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

export {runTerminals, runTerminal, initConfig, editConfig, kill};
