
/* IMPORT */

import type vscode from 'vscode';

/* MAIN */

type Env = {
  [key: string]: string
};

type Group = {
  autorun: boolean,
  autokill: boolean,
  env: Env,
  multiplexer: Multiplexer | undefined,
  workspace: string | undefined,
  terminals: Terminal[]
};

type GroupRaw = Partial<Omit<Group, 'terminals'>> & {
  terminals?: TerminalRaw[]
};

type GroupQuickPickItem = vscode.QuickPickItem & {
  group: Group
};

type Multiplexer = (
  'screen' |
  'tmux'
);

type SubstitutionsMap = {
  userHome: string,
  workspaceFolder: string,
  workspaceFolderBasename: string,
  file: string,
  fileWorkspaceFolder: string,
  relativeFile: string,
  relativeFileDirname: string,
  fileBasename: string,
  fileBasenameNoExtension: string,
  fileExtname: string,
  fileDirname: string,
  fileDirnameBasename: string,
  cwd: string,
  lineNumber: string,
  selectedText: string,
  execPath: string,
  defaultBuildTask: string,
  pathSeparator: string,
  '/': string
};

type SubstitutionsOptions = {
  workspace?: string,
  cwd?: string
};

type Terminal = {
  autorun: boolean,
  autokill: boolean,

  name: string,
  description: string | undefined,
  icon: string | undefined,
  color: string | undefined,

  workspace: string | undefined,
  cwd: string | undefined,
  commands: string[],

  persistent: string | undefined,
  split: string | undefined,
  target: string | undefined,

  dynamicTitle: boolean,
  execute: boolean,
  focus: boolean,
  open: boolean,
  recycle: boolean,

  onlyAPI: boolean,
  onlySingle: boolean,
  onlyMultiple: boolean,

  env: Env,
  multiplexer: Multiplexer | undefined,
  shellPath: string | undefined,
  shellArgs: string[]
};

type TerminalRaw = Partial<Terminal> & {
  command?: string,
};

type TerminalQuickPickItem = vscode.QuickPickItem & {
  terminal: Terminal
};

/* EXPORT */

export type {Env, Group, GroupRaw, GroupQuickPickItem, Multiplexer, SubstitutionsMap, SubstitutionsOptions, Terminal, TerminalRaw, TerminalQuickPickItem};
