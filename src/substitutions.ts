
/* IMPORT */

import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';
import Utils from './utils';
import { WorkspaceFolder } from 'vscode';

/* SUBSTITUTIONS */

const Substitutions = {

  get () {

    const workspaceFolder = Utils.folder.getActiveRootPath () || '',
          workspaceFolderBasename = path.basename ( workspaceFolder ),
          file = _.get ( vscode.window.activeTextEditor, 'document.uri.fsPath' ) as string || '',
          fileExtname = path.extname ( file ),
          relativeFile = path.relative ( workspaceFolder, file ),
          fileBasename = path.basename ( file ),
          fileBasenameNoExtension = path.basename ( file, fileExtname ),
          fileDirname = path.dirname ( file ),
          cwd = workspaceFolder,
          lineNumber = ( _.get ( vscode.window.activeTextEditor, 'selection.start.line' ) as number || 0 ) + 1;

    return {workspaceFolder, workspaceFolderBasename, file, relativeFile, fileBasename, fileBasenameNoExtension, fileDirname, fileExtname, cwd, lineNumber};

  },

  apply ( target, substitutions ) {

    if ( _.isArray ( target ) ) {

      return target.map ( value => Substitutions.apply ( value, substitutions ) );

    } else if ( _.isPlainObject ( target ) ) {

      return _.reduce ( target, ( acc, value, key ) => {

        acc[key] = Substitutions.apply ( value, substitutions );

        return acc;

      }, {} );

    } else if ( _.isString ( target ) ) {

      _.forOwn ( substitutions, ( value, key ) => {

        const re = new RegExp ( `\\[${_.escapeRegExp ( key )}\\]`, 'g' );

        target = target.replace ( re, value );

      });

    }

    return target;

  }

};

/* EXPORT */

export default Substitutions;
