# cc65-redux Plugin For Compiling and Linking  C & Assembly

This Visual Studio Code extension allows you to interact with CC65 for 6502/65816 machines.
It is a resurrection of the original cc65 extension which was removed from github.

The original extension is still available on the marketplace
<https://marketplace.visualstudio.com/items?itemName=SharpNinja.cc65>

## Features

The extension offers syntax highlighting and some commands to build an executable program from the assembler source code.

Output files are put into the build/ directory in the workspace.

Some features are not completed yet.

* "CC65: Build using script file from analyze/manual step" runs the build script done by the analysis step
* "CC65: Create a build script based on sources in the ./src directory of the workspace" creates the build script
* "CC65: Clean the build directory" of files generated from the build script
* "CC65: Run Program in Emulator" runs the script build target in the emulator
* "CC65: Launch the Emulator" launches the set emulator


## Requirements

You need to have CC65 already installed on your machine.

On Windows, it uses powershell to execute the batch files for processing.

You will want to have an emulator installed.

## Extension Settings

You will need to set the path to the CC65 package, for example:

### Root location of the CC65 binaries

```json
{
    "cc65.cc65": "C:\\cc65"
}
```

You will need to set any options for cl65, for example:

### Location of custom config file

```json
{
    "cc65.cl65.config": "c:\\cc65\\cfg\\atarixl.cfg"
}
```

You will need to set the machine target to build with, for example:

### Target machine to use for compilation and linking

```json
{
    "cc65.cl65.target": "atarixl",
}
```

You will need to set the path to your emulator and other settings, for example:
TODO: Add

```json
{
    "cc65.emulatorPath": "???",
    "cc65.emulatorPrelaunch": "???",
    "cc65.emulatorOptions": "???"
}
```

These can be windows, linux, or mac
You MUST set your environment options, for example:
Only "windows" works for now

```json
{
    "cc65.buildenv": "windows",
    "cc65.vscodeenv": "windows",
    "cc65.testenv": "windows"
}
```

## Workspace

You must put your project in a VS Code workspace.  This workspace must have the following layout:

* Makefile (optional - required to build/run with Make)
* prelaunch.ps1 (optional - script to execute before running emulator for Windows)
* prelaunch.sh (optional - srcipt to execute before running emulator for Mac/Linux)
* src/ (must have one file of at least one of these types to compile)
  * *.c
  * *.s
  * *.asm
  * *.inc
  * *.h
  * *.mac
  * res/ (optional - non-compilable resource files)
* tools/ (optional - outside tools that may be used in configurable events)

## Known Issues

None yet.
