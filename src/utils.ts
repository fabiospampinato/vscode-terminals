
/* IMPORT */

import * as _ from 'lodash';
import * as absolute from 'absolute';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as pify from 'pify';
import * as vscode from 'vscode';
import * as Commands from './commands';

/* UTILS */

const Utils = {

  initCommands ( context: vscode.ExtensionContext ) {

    /* CONTRIBUTIONS */

    const {commands} = vscode.extensions.getExtension ( 'fabiospampinato.vscode-terminals' ).packageJSON.contributes;

    commands.forEach ( ({ command, title }) => {

      const commandName = _.last ( command.split ( '.' ) ) as string,
            handler = Commands[commandName],
            disposable = vscode.commands.registerCommand ( command, () => handler () );

      context.subscriptions.push ( disposable );

    });

    /* HARD CODED */

    ['terminals.runTerminalByName'].forEach ( command => {

      const commandName = _.last ( command.split ( '.' ) ) as string,
            handler = Commands[commandName],
            disposable = vscode.commands.registerCommand ( command, handler );

      context.subscriptions.push ( disposable );

    });

    return Commands;

  },

  delay ( ms ) {

    return new Promise ( resolve => setTimeout ( resolve, ms ) );

  },

  file: {

    open ( filepath, isTextDocument = true ) {

      filepath = path.normalize ( filepath );

      const fileuri = vscode.Uri.file ( filepath );

      if ( isTextDocument ) {

        return vscode.workspace.openTextDocument ( fileuri )
                               .then ( vscode.window.showTextDocument );

      } else {

        return vscode.commands.executeCommand ( 'vscode.open', fileuri );

      }

    },

    async make ( filepath, content ) {

      await pify ( mkdirp )( path.dirname ( filepath ) );

      return Utils.file.write ( filepath, content );

    },

    async read ( filepath ) {

      try {
        return (  await pify ( fs.readFile )( filepath, { encoding: 'utf8' } ) ).toString ();
      } catch ( e ) {
        return;
      }

    },

    async write ( filepath, content ) {

      return pify ( fs.writeFile )( filepath, content, {} );

    }

  },

  folder: {

    getRootPath ( basePath? ) {

      const {workspaceFolders} = vscode.workspace;

      if ( !workspaceFolders ) return;

      const firstRootPath = workspaceFolders[0].uri.fsPath;

      if ( !basePath || !absolute ( basePath ) ) return firstRootPath;

      const rootPaths = workspaceFolders.map ( folder => folder.uri.fsPath ),
            sortedRootPaths = _.sortBy ( rootPaths, [path => path.length] ).reverse (); // In order to get the closest root

      return sortedRootPaths.find ( rootPath => basePath.startsWith ( rootPath ) );

    },

    getActiveRootPath () {

      const {activeTextEditor} = vscode.window,
            editorPath = activeTextEditor && activeTextEditor.document.uri.fsPath;

      return Utils.folder.getRootPath ( editorPath );

    }

  },

  config: {

    walkTerminals ( obj, terminalCallback, sortTerminals ) {

      if ( obj.terminals ) {

        const terminals = sortTerminals ? _.sortBy ( obj.terminals, terminal => terminal['name'].toLowerCase () ) : obj.terminals;

        terminals.forEach ( terminal => {

          terminalCallback ( terminal, obj );

        });

      }

    }

  },

  ui: {

    makeItems ( config, obj, itemMaker: Function ) {

      /* VARIABLES */

      const items = [];

      let terminalsNr = 0;

      /* ITEMS */

      Utils.config.walkTerminals ( obj, terminal => {

        items.push ( itemMaker ( config, terminal ) );

        terminalsNr++;

      }, config.sortTerminals );

      return {items, terminalsNr};

    },

    makeQuickPickItem ( config, obj ) {

      const icon = obj.icon ? `$(${obj.icon}) ` : '',
            name = `${icon}${obj.name}`,
            description = config.showDescriptions && obj.description,
            commands =  _.castArray ( obj.commands || [] );

      if ( obj.command ) commands.unshift ( obj.command );

      const commandsStr = config.showCommands ? commands.join ( ' && ' ) : '',
            topDetail = config.invertCommandsAndDescription ? description : commandsStr,
            bottomDetail = config.invertCommandsAndDescription ? commandsStr : description;

      return {
        obj,
        label: name,
        description: topDetail,
        detail: bottomDetail
      };

    }

  },

  multiplexer: {

    reattach ( multiplexer, session ) {

      switch ( multiplexer ) {

        case 'screen':
          return `screen -D -R ${session}`;

        case 'tmux':
          return `tmux attach -t ${session} || tmux new -s ${session}`;

        default:
          throw new Error ( 'Unsupported multiplexer' );

      }

    }

  }

};

/* EXPORT */

export default Utils;
