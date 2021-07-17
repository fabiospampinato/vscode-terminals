
/* IMPORT */

import * as vscode from 'vscode';
import beggar from 'vscode-beggar';
import * as Commands from './commands';
import Config from './config';
import Substitutions from './substitutions';
import Utils from './utils';

/* HELPERS */

async function autostartWorkspaceFolders ( folders?: readonly vscode.WorkspaceFolder[] ) {

  if ( !folders || !folders.length ) return;

  const rootPaths = folders.map ( folder => folder.uri.fsPath ),
        configs = await Promise.all ( rootPaths.map ( rootPath => Config.get ( rootPath ) ) ),
        substitutions = Substitutions.get ();

  configs.forEach ( ( config, i ) => {
    if ( config.autorun ) {
      Commands.runTerminals ( rootPaths[i], substitutions );
    }
  });

}

/* ACTIVATE */

async function activate ( context: vscode.ExtensionContext ) {

  beggar ({
    id: 'vscode-terminals',
    title: '𝗧𝗲𝗿𝗺𝗶𝗻𝗮𝗹𝘀 𝗠𝗮𝗻𝗮𝗴𝗲𝗿 - 𝗙𝘂𝗻𝗱𝗿𝗮𝗶𝘀𝗶𝗻𝗴 𝗔𝗻𝗻𝗼𝘂𝗻𝗰𝗲𝗺𝗲𝗻𝘁: We are collecting some money to allow for further development, if you find this extension useful please please please consider donating to it and be part of something amazing!',
    url: 'https://buy.stripe.com/aEU01Nbodadx6sM3cH',
    actions: {
      yes: {
        webhook: `https://telemetry.notable.app/track?events=%5B%7B%22event%22%3A%22vscode-beggar%22%2C%22extension%22%3A%22vscode-terminals%22%2C%22result%22%3A1%2C%22timestamp%22%3A${Date.now ()}%7D%5D`
      },
      no: {
        webhook: `https://telemetry.notable.app/track?events=%5B%7B%22event%22%3A%22vscode-beggar%22%2C%22extension%22%3A%22vscode-terminals%22%2C%22result%22%3A0%2C%22timestamp%22%3A${Date.now ()}%7D%5D`
      },
      cancel: {
        webhook: `https://telemetry.notable.app/track?events=%5B%7B%22event%22%3A%22vscode-beggar%22%2C%22extension%22%3A%22vscode-terminals%22%2C%22result%22%3A2%2C%22timestamp%22%3A${Date.now ()}%7D%5D`
      }
    }
  });

  Utils.initCommands ( context );

  autostartWorkspaceFolders ( vscode.workspace.workspaceFolders );
  vscode.workspace.onDidChangeWorkspaceFolders ( ({ added }) => {
    autostartWorkspaceFolders ( added );
  });

  return Commands;

}

/* EXPORT */

export {activate};
