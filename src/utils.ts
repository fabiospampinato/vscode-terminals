
/* IMPORT */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import JSONC from 'tiny-jsonc';
import * as vscode from 'vscode';
import Substitutions from './substitutions';
import {getConfig, getProjectRootPath, getProjectRootPaths} from 'vscode-extras';
import type {Env, Group, Multiplexer, Terminal, TerminalQuickPickItem} from './types';

/* MAIN */

const attempt = <T> ( fn: () => T ): T | undefined => {

  try {

    return fn ();

  } catch {

    return;

  }

};

const delay = ( ms: number ): Promise<void> => {

  return new Promise ( resolve => setTimeout ( resolve, ms ) );

};

const getConfigPath = ( rootPath?: string ): string | undefined => {

  rootPath ||= getProjectRootPath ();

  if ( !rootPath ) return;

  const configPath = path.join ( rootPath, '.vscode', 'terminals.json' );

  return configPath;

};

const getEnvFromUnknown = ( value: unknown ): Env => {

  if ( !isObject ( value ) ) return {};

  const env: Env = {};

  for ( const key in value ) {

    const val = value[key];

    if ( isNil ( val ) ) continue;

    env[key] = `${val}`;

  }

  return env;

};

const getGroupFromUnknown = ( value: unknown, workspace?: string ): Group | undefined => {

  if ( !isObject ( value ) ) return;

  const processEnv = getEnvFromUnknown ( process.env );

  const substitutions = Substitutions.getAll ({ workspace, env: processEnv });
  const substitute = <T extends string | string[] | Record<string, string>> ( value: T ) => Substitutions.apply ( value, substitutions );

  const valueEnv = isObject ( value['env'] ) ? substitute ( getEnvFromUnknown ( value['env'] ) ) : {};
  const env = { ...processEnv, ...valueEnv };

  const autorun = isBoolean ( value['autorun'] ) ? value['autorun'] : false;
  const autokill = isBoolean ( value['autokill'] ) ? value['autokill'] : false;

  const multiplexer = value['multiplexer'] === 'screen' || value['multiplexer'] === 'tmux' ? value['multiplexer'] : undefined;
  const shellPath = isString ( value['shellPath'] ) ? substitute ( untildify ( value['shellPath'] ) ) : undefined;
  const shellArgs = isArray ( value['shellArgs'] ) && value['shellArgs'].every ( isString ) ? value['shellArgs'].map ( substitute ) : [];

  const group: Group = { autorun, autokill, workspace, env, multiplexer, shellPath, shellArgs, terminals: [] };
  const terminals = isArray ( value['terminals'] ) ? value['terminals'].map ( terminal => getTerminalFromUnknown ( terminal, group ) ).filter ( isTruthy ) : [];

  return {
    autorun, autokill,
    workspace,
    env, multiplexer, shellPath, shellArgs,
    terminals
  };

};

const getGroupQuickPickItems = ( group: Group, filterer?: ( terminal: Terminal ) => boolean ): TerminalQuickPickItem[] => {

  const terminals = filterer ? group.terminals.filter ( filterer ) : group.terminals;
  const items = terminals.map ( getTerminalQuickPickItem );

  return items;

};

const getGroups = (): Group[] => {

  const internalGroups = getGroupsFromInternalConfig ();
  const externalGroups = getGroupsFromExternalConfigs ();
  const groups = [...internalGroups, ...externalGroups];

  return groups;

};

const getGroupsFromInternalConfig = (): Group[] => {

  const workspace = getProjectRootPath ();
  const config = getConfig ( 'terminals' );
  const group = getGroupFromUnknown ( config, workspace );
  const groups = group ? [group] : [];

  return groups;

};

const getGroupsFromExternalConfig = ( rootPath?: string ): Group[] => {

  const workspace = rootPath ?? getProjectRootPath ();
  const configPath = getConfigPath ( rootPath );
  const configContent = attempt ( () => configPath && fs.readFileSync ( configPath, 'utf8' ) );
  const configParsed = attempt ( () => configContent && JSONC.parse ( configContent ) );
  const group = getGroupFromUnknown ( configParsed, workspace );
  const groups = group ? [group] : [];

  return groups;

};

const getGroupsFromExternalConfigs = ( rootPaths?: string[] ): Group[] => {

  rootPaths ??= getProjectRootPaths ();

  return rootPaths.flatMap ( getGroupsFromExternalConfig );

};

const getGroupsQuickPickItems = ( groups: Group[], filterer?: ( terminal: Terminal ) => boolean ): TerminalQuickPickItem[] => {

  return groups.flatMap ( group => getGroupQuickPickItems ( group, filterer ) );

};

const getMultiplexerReattachCommand = ( multiplexer: Multiplexer, session: string ): string => {

  if ( multiplexer === 'screen' ) {

    return `exec screen -D -R ${session}`;

  } else if ( multiplexer === 'tmux' ) {

    return `tmux has-session -t ${session} && exec tmux attach -t ${session} || tmux new -s ${session}`;

  } else {

    throw new Error ( 'Unsupported multiplexer' );

  }

};

const getTerminalByName = ( name: string ): vscode.Terminal | undefined => {

  return vscode.window.terminals.find ( terminal => {

    if ( !isUndefined ( terminal.exitStatus ) ) return false; // Terminated

    return terminal.name === name;

  });

};

const getTerminalFromUnknown = ( value: unknown, group: Group ): Terminal | undefined => {

  if ( !isObject ( value ) ) return;

  const workspace = group.workspace;

  const substitutionsPartial = Substitutions.getAll ({ workspace, env: group.env });
  const substitutePartial = <T extends string | string[] | Record<string, string>> ( value: T ) => Substitutions.apply ( value, substitutionsPartial );

  const cwdRaw = isString ( value['cwd'] ) ? untildify ( substitutePartial ( value['cwd'] ) ) : workspace;
  const cwd = workspace && cwdRaw ? path.resolve ( workspace, cwdRaw ) : cwdRaw;

  const valueEnv = isObject ( value['env'] ) ? substitutePartial ( getEnvFromUnknown ( value['env'] ) ) : {};
  const env = { ...group.env, ...valueEnv };

  const substitutions = Substitutions.getAll ({ workspace, cwd, env });
  const substitute = <T extends string | string[] | Record<string, string>> ( value: T ) => Substitutions.apply ( value, substitutions );

  const autorun = isBoolean ( value['autorun'] ) ? value['autorun'] : group.autorun;
  const autokill = isBoolean ( value['autokill'] ) ? value['autokill'] : group.autokill;

  const name = isString ( value['name'] ) ? value['name'] : undefined;
  const description = isString ( value['description'] ) ? substitute ( value['description'] ) : undefined;
  const icon = isString ( value['icon'] ) ? value['icon'] : undefined;
  const color = isString ( value['color'] ) ? value['color'] : undefined;

  const persistent = isString ( value['persistent'] ) ? value['persistent'] : undefined;
  const split = isString ( value['split'] ) ? value['split'] : undefined;
  const target = isString ( value['target'] ) ? value['target'] : undefined;

  const dynamicTitle = isBoolean ( value['dynamicTitle'] ) ? value['dynamicTitle'] : false;
  const execute = isBoolean ( value['execute'] ) ? value['execute'] : true;
  const focus = isBoolean ( value['focus'] ) ? value['focus'] : false;
  const open = isBoolean ( value['open'] ) ? value['open'] : false;
  const recycle = isBoolean ( value['recycle'] ) ? value['recycle'] : true;

  const onlyAPI = isBoolean ( value['onlyAPI'] ) ? value['onlyAPI'] : false;
  const onlySingle = isBoolean ( value['onlySingle'] ) ? value['onlySingle'] : false;
  const onlyMultiple = isBoolean ( value['onlyMultiple'] ) ? value['onlyMultiple'] : false;

  const multiplexer = value['multiplexer'] === 'screen' || value['multiplexer'] === 'tmux' ? value['multiplexer'] : group.multiplexer;
  const shellPath = isString ( value['shellPath'] ) ? substitute ( untildify ( value['shellPath'] ) ) : group.shellPath;
  const shellArgs = isArray ( value['shellArgs'] ) && value['shellArgs'].every ( isString ) ? value['shellArgs'].map ( substitute ) : group.shellArgs;

  const commandsMultiplexer = ( multiplexer && persistent ) ? [getMultiplexerReattachCommand ( multiplexer, persistent )] : [];
  const commandsStandalone = isString ( value['command'] ) ? [value['command']] : [];
  const commandsMultiple = isArray ( value['commands'] ) && value['commands'].every ( isString ) ? value['commands'] : [];
  const commands = substitute ([ ...commandsMultiplexer, ...commandsStandalone, ...commandsMultiple ]);

  if ( !name ) return;

  return {
    autorun, autokill,
    name, description, icon, color,
    workspace, cwd, commands,
    persistent, split, target,
    dynamicTitle, recycle, open, focus, execute,
    onlyAPI, onlySingle, onlyMultiple,
    env, multiplexer, shellPath, shellArgs
  };

};

const getTerminalQuickPickItem = ( terminal: Terminal ): TerminalQuickPickItem => {

  const icon = terminal.icon ? `$(${terminal.icon}) ` : '';
  const label = `${icon}${terminal.name}`;
  const description = terminal.description;

  return {
    label,
    description,
    terminal
  };

};

const isArray = ( value: unknown ): value is unknown[] => {

  return Array.isArray ( value );

};

const isBoolean = ( value: unknown ): value is boolean => {

  return typeof value === 'boolean';

};

const isNil = ( value: unknown ): value is null | undefined => {

  return value === null || value === undefined;

};

const isNumber = ( value: unknown ): value is number => {

  return typeof value === 'number';

};

const isObject = ( value: unknown ): value is Record<string, unknown> => {

  return typeof value === 'object' && value !== null;

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

const isTruthy = <T> ( value: T ): value is Exclude<T, 0 | -0 | 0n | -0n | '' | false | null | undefined | void> => {

  return !!value;

};

const isUndefined = ( value: unknown ): value is undefined => {

  return typeof value === 'undefined';

};

const untildify = ( filePath: string ): string => {

  if ( filePath.startsWith ( '~' ) ) {

    const homedir = os.homedir ();

    return path.join ( homedir, filePath.slice ( 1 ) );

  } else {

    return filePath;

  }

};

/* EXPORT */

export {getConfigPath};
export {getEnvFromUnknown};
export {getGroupFromUnknown, getGroupQuickPickItems};
export {getGroups, getGroupsFromInternalConfig, getGroupsFromExternalConfig, getGroupsFromExternalConfigs, getGroupsQuickPickItems};
export {getMultiplexerReattachCommand};
export {getTerminalByName, getTerminalFromUnknown, getTerminalQuickPickItem};
export {attempt, delay, isArray, isBoolean, isNil, isNumber, isObject, isString, isTruthy, isUndefined};
export {untildify};
