
/* IMPORT */

import * as _ from 'lodash';
import merge from 'conf-merge';
import * as JSON5 from 'json5';
import * as path from 'path';
import * as vscode from 'vscode';
import Utils from './utils';

/* CONFIG */

const Config = {

  getDefaults () {

    const defaults: any = { terminals: [] },
          rootPath = vscode.workspace.rootPath;

    if ( rootPath ) defaults.configPath = path.join ( rootPath, '.vscode', 'terminals.json' );

    return defaults;

  },

  getExtension ( extension = 'terminals' ) {

    const config = vscode.workspace.getConfiguration ().get ( extension ) as any;

    if ( !config['configPath'] ) delete config['configPath'];

    return config;

  },

  async getFile ( filepath ) {

    const content = await Utils.file.read ( filepath );

    if ( !content || !content.trim () ) return;

    const config: any = _.attempt ( JSON5.parse, content );

    if ( _.isError ( config ) ) {

      const option = await vscode.window.showErrorMessage ( '[Terminals] Your configuration file contains improperly formatted JSON', { title: 'Overwrite' }, { title: 'Edit' } );

      if ( option && option.title === 'Overwrite' ) {

        await Utils.file.write ( filepath, '{}' );

        return {};

      } else {

        if ( option && option.title === 'Edit' ) {

          Utils.file.open ( filepath );

        }

        throw new Error ( 'Can\'t read improperly formatted configuration file' );

      }

    }

    return config;

  },

  async get () {

    const defaults = Config.getDefaults (),
          extension: any = Config.getExtension (),
          configPath: string = extension.configPath || defaults.configPath,
          config = configPath && await Config.getFile ( configPath );

    return merge ( {}, defaults, extension, config ) as any;

  }

};

/* EXPORT */

export default Config;
