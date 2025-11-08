# Terminals Manager

<p align="center">
  <img src="https://raw.githubusercontent.com/fabiospampinato/vscode-terminals/master/resources/logo.png" width="128" alt="Logo">
</p>

An extension for setting-up multiple terminals at once, or just running some commands.

The extension is configured using a very easy to edit JSONC file.

## Install

Follow the instructions in the [Marketplace](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-terminals), or run the following in the command palette:

```shell
ext install fabiospampinato.vscode-terminals
```

## Usage

It adds 4 new commands to the command palette:

```js
'Terminals: Edit Configuration' // Open the configuration file, or create it if it doesn't exist
'Terminals: Kill' // Kill all the terminals
'Terminals: Run' // Run all the terminals
'Terminals: Run Single' // Select and run a single terminal
```

It adds 1 shortcut:

```js
'Cmd/Ctrl+Alt+T' // Triggers "Terminals: Run Single"
```

## Configuration

Run the `Terminals: Edit Configuration` command to create the configuration file. It will create a file named `terminals.json` under the `.vscode` directory in your current open project.

The configuration is an object that looks like the following, most properties are optional:

```js
{
  // First of all some global options are supported that all terminals defined below will inherit from
  "autorun": true, // Execute terminals automatically at startup or when the project is added to the workspace
  "autokill": true, // Kill all the terminals created from this configuration when the project is removed from the workspace
  "env": { "name": "value" }, // Object containing custom environment variables
  "multiplexer": "screen", // The terminal multiplexer that persistent terminals will use, either "screen" or "tmux" are supported

  // Then we define the actual terminals
  "terminals": [
    { // An object describing a terminal, most entries are optional
      "autorun": true, // Execute the terminal automatically at startup or when the project is added to the workspace
      "autokill": true, // Kill the terminal when the project is removed from the workspace

      "name": "My Terminal", // The name of the terminal, it will be displayed in the dropdown
      "description": "A terminal that runs some commands", // The description of the terminal
      "icon": "code", // An icon to show next to the name, ref: https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
      "color": "terminal.ansiCyan", // A supported themeable color, ref: https://code.visualstudio.com/api/references/theme-color#integrated-terminal-colors

      "cwd": "/Users/fabio/Desktop", // A path for the current working directory to be used for the terminal
      "command": "whoami", // Single command to run
      "commands": [ // Multiple commands to run
        "cd to/my/chest",
        "touch my_heart"
      ],

      "persistent": "unique_session_name", // Keep the process running even when closing the terminal and reuse it, preservig the output. This unique session name will be passed to the terminal multiplexer
      "split": "My Parent Terminal", // The name of the other (open) terminal to split from
      "target": "My Other Terminal",// Execute the commands in this terminal's instance

      "dynamicTitle": true, // Don't use the "name" as the title, let it be dynamic depending on the command being executed
      "execute": false, // Write the last command without executing it
      "focus": true, // Open the terminal after executing its commands and focus to it
      "open": true, // Open the terminal after executing its commands, but don't move the focus to it
      "recycle": false, // Always create a new terminal

      "onlyAPI": true, // Don't run this with the "Terminals: Run" command and hide it from the "Terminals: Run Single" command, useful when programmatically calling the "terminals.runTerminalByName" command
      "onlySingle": true, // Don't run this with the "Terminals: Run" command
      "onlyMultiple": true, // Hide it from the "Terminals: Run Single" command

      "env": { "name": "value" }, // Object containing additional environment variables that will be applied to this terminal
      "multiplexer": "tmux", // The terminal multiplexer that this terminal will use, if persistent
      "shellPath": '/bin/bash', // Path to a custom shell executable
      "shellArgs": ["--foo"], // Arguments to pass to the shell executable
    }
  ]
}
```

## Details

- **Autorun/Autokill**: these features allow the extension to automatically run and kill terminals so that you don't have to explicitly run any command to set a project up after opening it, just opening it will be enough. It's an optional feature that you may not need at all, but that may be convenient to you.
- **Global-level terminals**: you can also define additional global-level terminals in your VSCode settings files, that will be available in every project, using the same exact configuration format, but basically prefixing every top-level key with `terminals.`, so `terminals.autorun`, `termunals.terminals` etc., the rest stays unchanged.
- **Multiplexer-level persistence**: a basic form of multiplexer-based persistance is supported, via either [GNU Screen](https://en.wikipedia.org/wiki/GNU_Screen) or [tmux](https://en.wikipedia.org/wiki/Tmux), which will persist terminals even if you close vscode, and it will reattach to them when you reopen vscode. For it to work you need to respectively have the `screen` or `tmux` commands already installed in your system.
- **Native-level persistence**: VSCode supports persisting terminals nativelly. To avoid conflicts this feature is automatically disabled for terminals created by this extension, and you might want to disable it globally as well, by setting the `terminal.integrated.persistentSessionReviveProcess` setting to `never`.
- **Variable substitutions**: all the variables defined [here](https://code.visualstudio.com/docs/reference/variables-reference) can be substituted in your configuration, by writing for example `[userHome]` or `${userHome}` somewhere. Variable substitution is supported for the following configuration properties only: `description`, `cwd`, `command`, `command`, `env`.
- **Env substitutions**: addionally values from the provided `env` object can be substituted by writing for example `[env:key]` or `${env:key}` somewhere. Env substitution is supported for the following configuration properties only: `description`, `cwd`, `command`, `commands`.
- **Tilde substitution**: paths starting with a tilde, like `~/Dekstop` are also supported, the tilde will be automatically resolved. This is supported for the following configuration properties only: `cwd`, `shellPath`.
- **JSONC support**: the configuration file supports comments and trailing commas, as it's read as a JSONC file, even though the extension will be `.json` for legacy reasons.
- **Icons**: all the supported icons, that you can use for the optional `icon` property of each terminal, are listed [here](https://code.visualstudio.com/api/references/icons-in-labels#icon-listing).
- **Colors**: all the supported colors, that you can use for the optional `color` property of each terminal, are listed [here](https://code.visualstudio.com/api/references/theme-color#integrated-terminal-colors).
- **Programmatic execution**: you can also execute a terminal programmatically, from other extensions, for example my [Commands](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-commands) extension, by calling the `terminals.runTerminalByName` command and passing the terminal name as argument.
- **Self-destroying terminals**: it's a common use case to run some commands and then close the terminal, to do this simply put an `exit 0` command at the end of your commands list.

## License

MIT © Fabio Spampinato
