
/* IMPORT */

import vscode from 'vscode';
import * as Commands from './commands';
import Runner from './runner';

/* MAIN */

const activate = (): void => {

  /* COMMANDS */

  vscode.commands.registerCommand ( 'terminals.editConfig', Commands.editConfig );
  vscode.commands.registerCommand ( 'terminals.kill', Commands.kill );
  vscode.commands.registerCommand ( 'terminals.runTerminal', Commands.runTerminal );
  vscode.commands.registerCommand ( 'terminals.runTerminalByName', Commands.runTerminalByName );
  vscode.commands.registerCommand ( 'terminals.runTerminals', Commands.runTerminals );

  /* AUTORUN & AUTOKILL */

  vscode.workspace.onDidChangeWorkspaceFolders ( ({ added, removed }) => {
    added.forEach ( folder => Commands.autorunTerminalsByWorkspace ( folder.uri.fsPath ) );
    removed.forEach ( folder => Commands.autokillTerminalsByWorkspace ( folder.uri.fsPath ) );
  });

  /* CLEANUP */

  vscode.window.onDidCloseTerminal ( Runner.unrun );

};

/* EXPORT */

export {activate};
