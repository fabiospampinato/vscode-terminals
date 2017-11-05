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
  "autorun": true, // Execute `Terminals: Run` automatically at startup
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
      "open": true, // Open the terminal after running its commands
      "focus": true, // Open the terminal after running its commands and focus to it
      "onlySingle": true, // Don't run this with the `Terminals: Run` command
      "onlyMultiple": true, // Hide it from the `Terminals: Run Single` command
      "onlyAPI": true, // Don't run this with the `Terminals: Run` command and hide it from the `Terminals: Run Single` command
      "execute": false, // Write the last command without executing it
      "shellPath": '/bin/bash', // Path to a custom shell executable
      "shellArgs": ["--foo"] // Arguments to pass to the shell executable
    }
  ]
}
```

You can also define terminals in your Visual Studio Code settings file under the key `terminals.terminals`. This way you can have global terminals, which are always available, while still having the ability to add some project-specific terminals in your configuration file.

## Demo

#### Edit Configuration + Run:

![Run](resources/run.gif)

#### Run Single

![Run Single](resources/run_single.gif)

## Hints

- **[Commands](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-commands)**: Use this other extension, the `terminals.runTerminalByName` command and, optionally, the `onlyAPI` configuration option to create terminals that can be run with a click from the statusbar.
- **Self-destroying terminals**: it's a common use case to run some commands and then close the terminal, to do this simply put a `logout` command at the end of your commands list.

## License

MIT © Fabio Spampinato
