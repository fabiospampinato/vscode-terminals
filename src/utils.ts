
/* IMPORT */

import * as _ from 'lodash';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as pify from 'pify';
import * as vscode from 'vscode';
import * as Commands from './commands';

/* UTILS */

const Utils = {

  initCommands () {

    const {commands} = vscode.extensions.getExtension ( 'fabiospampinato.vscode-terminals' ).packageJSON.contributes;

    commands.forEach ( ({ command, title }) => {

      const commandName = _.last ( command.split ( '.' ) ) as string,
            handler = Commands[commandName];

      vscode.commands.registerCommand ( command, handler );

    });

    return Commands;

  },

  delay ( ms ) {

    return new Promise ( resolve => setTimeout ( resolve, ms ) );

  },

  file: {

    open ( filepath ) {

      return vscode.commands.executeCommand ( 'vscode.open', vscode.Uri.parse ( `file://${filepath}` ) );

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

  }

};

/* EXPORT */

export default Utils;
