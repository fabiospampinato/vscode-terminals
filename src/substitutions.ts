
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

  apply ( string, substitutions ) {

    _.forOwn ( substitutions, ( value, key ) => {
      string = string.replace ( `[${key}]`, value );
    });

    return string;

  }

};

/* EXPORT */

export default Substitutions;
