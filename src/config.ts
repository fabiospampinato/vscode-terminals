
/* IMPORT */

import * as _ from 'lodash';
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

    const config = vscode.workspace.getConfiguration ().get ( extension );

    return _.omitBy ( config, _.isEmpty );

  },

  async getFile ( filepath ) {

    const file = await Utils.file.read ( filepath );

    if ( !file ) return;

    const config = _.attempt ( JSON.parse, file );

    if ( _.isError ( config ) ) return;

    return config;

  },

  async get () {

    const defaults = Config.getDefaults (),
          extension: any = Config.getExtension (),
          configPath: string = extension.configPath || defaults.configPath,
          config = configPath && await Config.getFile ( configPath );

    return _.merge ( {}, defaults, extension, config );

  }

};

/* EXPORT */

export default Config;
