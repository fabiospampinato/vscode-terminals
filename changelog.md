### Version 2.0.0
- Rewritten: more modern code, no third-party dependencies, 99% smaller bundle
- Removed donation popup, thank you for your support!
- Removed `configPath` global option, for simplicity
- Removed `invertCommandsAndDescription` global option, for simplicity
- Removed `showCommands` global option, for simplicity
- Removed `showDescriptions` global option, for simplicity
- Removed `sortTerminals` global option, for simplicity
- Added `multiplexer` global option, which terminals inherit
- Removed `substitution` terminal option, for simplicity
- Removed `envInherit` terminal option, for simplicity
- Added `autorun` terminal option, for overriding the inherited global option
- Added `autokill` terminal option, for overriding the inherited global option
- Added variable substitution support for all the variables listed [here](https://code.visualstudio.com/docs/reference/variables-reference#_predefined-variables)
- Added variable substitution that references environment variables, by using the syntax `[env:key]`
- Added variable substitution support with the `${foo}` syntax, other than the already supported `[foo]` syntax
- Added variable substitution support for the `description` and `shellArgs` properties
- Automatically disabling vscode-level terminal persistence for terminals created by this extension, as it conflicts with our own
- Ensuring the `terminals.json` file is handled as JSONC, despite the legacy `.json` extension
- Ensuring `terminals.json` files are matched against a schema
- Ensuring terminals defined in vscode's settings are matched against a schema

### Version 1.15.0
- Added a "split" option for each terminal, it should be the name of a currently open terminal to split

### Version 1.14.0
- New terminal option: "dynamicTitle", for letting the title of the terminal depend on the command currently being executed in it
- Wait for the startup to finish before initializing

### Version 1.13.0
- Added support for disabling donation prompts by setting "donations.disablePrompt" to "true"
- Added support for rendering icons in the terminals list (thanks @alkemir)
- Added support for rendering the icon in a custom color in the terminals list

### Version 1.12.10
- Update .github/FUNDING.yml
- Deleted repo-level github funding.yml
- Added a dialog announcing the fundraising

### Version 1.12.9
- Improved error message when an cwd path doesn't exist

### Version 1.12.8
- Ensuring the default configuration location is used if none is provided

### Version 1.12.7
- Ensuring we are not mutating VSC’s config object

### Version 1.12.6
- Checking for cwd’s existence only after properly parsing it

### Version 1.12.5
- Showing an error when using invalid cwd paths

### Version 1.12.4
- Readme: using hi-res logo

### Version 1.12.3
- Outputting modern code (es2017, faster)
- Using "Debug Launcher" for debugging

### Version 1.12.2
- Allowing terminals without commands
- Fixed `shellArgs` support

### Version 1.12.1
- Bundling with webpack

### Version 1.12.0
- Variable substitution: added support for the `cwd`, `shellArgs` and `env` configuration fields
- CWD: added support for relative paths
- CWD: added support for paths starting with a tilde (~)

### Version 1.11.7
- Variable substituion: ensuring all instance of each token get replaced

### Version 1.11.6
- Ensuring the configuration gets opened as a non-preview editor

### Version 1.11.5
- Variable Substitution: putting the tokens in a table

### Version 1.11.4
- Replaced `logout` with `exit 0`

### Version 1.11.3
- Ensuring autorun terminals in a multi-root workspace work, no matter the order of the roots

### Version 1.11.2
- Supporting only string environment variables

### Version 1.11.1
- Updated readme

### Version 1.11.0
- Added support for persistent terminals

### Version 1.10.0
- Added a `cwd` configuration option

### Version 1.9.0
- Added support for environment variables
- Updated keywords
- Renamed to `Terminals Manager`

### Version 1.8.1
- Readme: added an hint about icons

### Version 1.8.0
- Added support for variable substitution
- Added an option for disabling variable substitution

### Version 1.7.0
- Add multi-root support

### Version 1.6.1
- Added support for virtual targets

### Version 1.6.0
- Added a `recycle` and `target` option
- Ensured the default configuration works on bash and zsh

### Version 1.5.3
- Fixed support for global terminals

### Version 1.5.2
- Improved shortcuts documentation

### Version 1.5.1
- Updated readme

### Version 1.5.0
- Added a `sortTerminals` option

### Version 1.4.0
- Added support for inverting commands and description in the quickpick

### Version 1.3.0
- Added support for showing commands in the quickpick

### Version 1.2.0
- Added support for descriptions

### Version 1.1.1
- Using JSON5 in order to be more human-friendly
- Improved read of improperly formatted configurations

### Version 1.1.0
- Added `onlyAPI` option
- Added `runTerminalByName` command

### Version 1.0.10
- Improved Windows support

### Version 1.0.9
- Renamed some commands

### Version 1.0.8
- Catching an error

### Version 1.0.7
- Improved initialization logic

### Version 1.0.6
- Fixed a bug
- Fixed a typo

### Version 1.0.5
- Assigned cmd-alt-p (Mac) or ctrl-alt-p (Elsewhere) to `Terminals: Run Single`

### Version 1.0.4
- Added an `icon` option

### Version 1.0.3
- Added a `Terminals: Kill` command
- Added an `onlyMultiple` option
- Added an `autorun` option
- Added this changelog

### Version 1.0.0
- Initial release
