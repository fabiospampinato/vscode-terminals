
/* IMPORT */

import os from 'node:os';
import path from 'node:path';
import vscode from 'vscode';
import {getActiveFilePath, getProjectRootPath} from 'vscode-extras';
import {isArray, isObject, isString} from './utils';
import type {Env, SubstitutionsMap, SubstitutionsEnvMap, SubstitutionsOptions} from './types';

/* MAIN */

//URL: https://code.visualstudio.com/docs/editor/variables-reference#_predefined-variables

const Substitutions = {

  apply: <T extends string | string[] | Record<string, string>>( target: T, substitutions: SubstitutionsMap ): T => {

    if ( isArray ( target ) ) {

      return Substitutions.applyToArray ( target, substitutions ) as T; //TSC

    } else if ( isObject ( target ) ) {

      return Substitutions.applyToObject ( target, substitutions ) as T; //TSC

    } else if ( isString ( target ) ) {

      return Substitutions.applyToString ( target as string, substitutions ) as T;

    } else {

      throw new Error ( 'Unsupported substitution target' );

    }

  },

  applyToArray: ( target: string[], substitutions: SubstitutionsMap ): string[] => {

    return target.map ( target => Substitutions.applyToString ( target, substitutions ) );

  },

  applyToObject: ( target: Record<string, string>, substitutions: SubstitutionsMap ): Record<string, string> => {

    const result: Record<string, string> = {};

    for ( const key in target ) {

      result[key] = Substitutions.applyToString ( target[key], substitutions );

    }

    return result;

  },

  applyToString: ( target: string, substitutions: SubstitutionsMap ): string => {

    for ( const [key, value] of Object.entries ( substitutions ) ) {

      target = target.replaceAll ( `[${key}]`, value );
      target = target.replaceAll ( `\${${key}}`, value );

    }

    return target;

  },

  getAll: ( options?: SubstitutionsOptions ): SubstitutionsMap => {

    const {activeTextEditor} = vscode.window;
    const activeFilePath = getActiveFilePath ();

    const env = Substitutions.getEnv ( options?.env );
    const userHome = os.homedir ();
    const workspaceFolder = options?.workspace ?? getProjectRootPath ( activeFilePath ) ?? '';
    const workspaceFolderBasename = path.basename ( workspaceFolder );
    const file = activeFilePath || '';
    const fileWorkspaceFolder = getProjectRootPath ( activeFilePath ) ?? '';
    const relativeFile = path.relative ( workspaceFolder, file );
    const relativeFileDirname = path.dirname ( relativeFile );
    const fileExtname = path.extname ( file );
    const fileBasename = path.basename ( file );
    const fileBasenameNoExtension = path.basename ( file, fileExtname );
    const fileDirname = path.dirname ( file );
    const fileDirnameBasename = path.basename ( fileDirname );
    const cwd = options?.cwd ?? workspaceFolder;
    const lineNumber = `${( activeTextEditor?.selection.start.line || 0 ) + 1}`;
    const selectedText = activeTextEditor?.document.getText ( activeTextEditor.selection ) || '';
    const execPath = process.execPath;
    const defaultBuildTask = `${vscode.workspace.getConfiguration ().get ( 'tasks.build' ) || ''}`;
    const pathSeparator = path.sep;

    return {
      ...env,
      userHome,
      workspaceFolder,
      workspaceFolderBasename,
      file,
      fileWorkspaceFolder,
      relativeFile,
      relativeFileDirname,
      fileExtname,
      fileBasename,
      fileBasenameNoExtension,
      fileDirname,
      fileDirnameBasename,
      cwd,
      lineNumber,
      selectedText,
      execPath,
      defaultBuildTask,
      pathSeparator,
      '/': pathSeparator,
    };

  },

  getEnv: ( env?: Env ): SubstitutionsEnvMap => {

    const substitutions: SubstitutionsEnvMap = {};

    if ( env ) {

      for ( const [key, value] of Object.entries ( env ) ) {

        substitutions[`env:${key}`] = value;

      }

    }

    return substitutions;

  }

};

/* EXPORT */

export default Substitutions;
