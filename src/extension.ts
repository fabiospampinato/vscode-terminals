
/* IMPORT */

import * as vscode from 'vscode';
import * as Commands from './commands';
import Config from './config';
import Utils from './utils';

/* HELPERS */

async function autostartWorkspaceFolders ( folders?: vscode.WorkspaceFolder[] ) {

  if ( !folders ) return;

  const rootPaths = folders.map ( folder => folder.uri.fsPath ),
        configs = await Promise.all ( rootPaths.map ( rootPath => Config.get ( rootPath ) ) );

  configs.forEach ( ( config, i ) => {
    if ( config.autorun ) {
      Commands.runTerminals ( rootPaths[i] );
    }
  });

}

/* ACTIVATE */

async function activate ( context: vscode.ExtensionContext ) {

  Utils.initCommands ( context );

  autostartWorkspaceFolders ( vscode.workspace.workspaceFolders );
  vscode.workspace.onDidChangeWorkspaceFolders ( ({ added }) => {
    autostartWorkspaceFolders ( added );
  });

  return Commands;

}

/* EXPORT */

export {activate};
