# VSC Terminals

<p align="center">
	<img src="https://raw.githubusercontent.com/fabiospampinato/vscode-terminals/master/resources/logo-128x128.png" alt="Logo">
</p>

An extension for setting-up multiple terminals at once, or just running some commands.

The extension is configured using a very easy to edit JSON file.

Check the demo below to learn more.

## Install

Run the following in the command palette:

```shell
ext install vscode-terminals
```

## Usage

It adds 4 new commands to the command palette:

```js
Terminals: Edit Configuration // Open the configuration file, it will create it for you if needed
Terminals: Kill // Kill all the terminals
Terminals: Run // Run all the terminals
Terminals: Run Single // Select a single terminal to run
```

It adds 1 shortcut:

```js
'Cmd/Ctrl+Alt+T' // Triggers `Terminals: Run Single`
```

## Settings

```js
{
  "terminals.invertCommandsAndDescription": false, // Invert a terminal commands and description in the quickpick
  "terminals.showCommands": false, // Show terminals' commands in the quickpick
  "terminals.showDescriptions": true, // Show terminals' descriptions in the quickpick
  "terminals.sortTerminals": false // Sort terminals alphabetically
}
```

## Configuration

Run the `Terminals: Edit Configuration` command to create the configuration file. By default it uses a file named `terminals.json` under the `.vscode` directory, you can change this by supplying a custom path using the `terminals.configPath` setting entry.

The configuration is an object that looks like this:

```js
{
  "autorun": true, // Execute `Terminals: Run` automatically at startup or when the project is added to the workspace
  "autokill": true, // Kill all the terminals created from this configuration when the project is removed from the workspace
  "terminals": [ // Array of terminals to open
    { // An object describing a terminal, most entries are optional
      "name": "My Terminal", // The name of the terminal, it will be displayed in the dropdown
      "description": "A terminal that runs some commands", // The description of the terminal
      "icon": "code", // An icon to show next to the name
      "command": "whoami", // Single command to run
      "commands": [ // Multiple commands to run
        "cd to/my/chest",
        "touch my_heart"
      ],
      "substitution": false, // Disable variable substitution for this terminal
      "recycle": false, // Always create a new terminal
      "target": "My Other Terminal",// Execute the commands in this terminal's instance
      "open": true, // Open the terminal after executing its commands
      "focus": true, // Open the terminal after executing its commands and focus to it
      "onlySingle": true, // Don't run this with the `Terminals: Run` command
      "onlyMultiple": true, // Hide it from the `Terminals: Run Single` command
      "onlyAPI": true, // Don't run this with the `Terminals: Run` command and hide it from the `Terminals: Run Single` command
      "execute": false, // Write the last command without executing it
      "shellPath": '/bin/bash', // Path to a custom shell executable
      "shellArgs": ["--foo"] // Arguments to pass to the shell executable
      "env": {"name": "value", "name2": "value2"}, // Key value pairs for enviroment variables
    }
  ]
}
```

You can also define terminals in your Visual Studio Code settings file under the key `terminals.terminals`. This way you can have global terminals, which are always available, while still having the ability to add some project-specific terminals in your configuration file.

## Variable Substitution

This extension supports some special strings that you can put in your commands, they will be substituted with the appropriate value when you execute the terminal. This is especially useful for defining global terminals. Here they are:

- `[workspaceFolder]`: the path of the workspace folder that contains the active file
- `[workspaceFolderBasename]`: the name of the workspace folder that contains the active file without any slashes (/)
- `[file]`: the current opened file
- `[relativeFile]`: the current opened file relative to the workspace folder containing the file
- `[fileBasename]`: the current opened file's basename
- `[fileBasenameNoExtension]`: the current opened file's basename without the extension
- `[fileDirname]`: the current opened file's dirname
- `[fileExtname]`: the current opened file's extension
- `[cwd]`: the current working directory on startup
- `[lineNumber]`: the current selected line number in the active file

## Demo

#### Edit Configuration + Run:

![Run](resources/run.gif)

#### Run Single

![Run Single](resources/run_single.gif)

## Hints

- **[Commands](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-commands)**: Use this other extension, the `terminals.runTerminalByName` command and, optionally, the `onlyAPI` configuration option to create terminals that can be run with a click from the statusbar.
- **Self-destroying terminals**: it's a common use case to run some commands and then close the terminal, to do this simply put a `logout` command at the end of your commands list.
- **Icons**: [here](https://octicons.github.com/) you can browse a list of supported icons. If for instance you click the first icon, you'll get a page with `.octicon-alert` written in it, to get the string to use simply remove the `.octicon-` part, so in this case the icon name would be `alert`.

## License

MIT © Fabio Spampinato
