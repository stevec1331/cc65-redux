# Change Log

All notable changes to the "cc65-redux" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- in progress

## [0.0.27] - 2020-07-25

- removing makefile support - better to use other vscode tools/extensions

## [0.0.26] - 2020-07-19

- adding makefile support

## [0.0.25] - 2020-06-26

- put the debug files next to the xex file

## [0.0.24] - 2020-06-17

- fix clean to remove the output binary from the build directory

## [0.0.23] - 2020-06-16

- modifed output path for script built to put binary in a /bin subdir of the build dir
- started adding support for makefile support

## [0.0.22] - 2020-03-10

- bugfixes after splitting apart script creation
- add async processing for creating build script in order to handle ShowQuickPick() correctly

## [0.0.21] - 2020-03-10

- split apart build script creation from script build
- remove 'build and run' commands

## [0.0.20] - 2020-03-10

- add .h to activation extension

## [0.0.19] - 2020-02-15

- change to atari as default target instead of atarixl

## [0.0.18] - 2020-01-26

- add back .c files as activation pattern

## [0.0.17] - 2020-01-26

- change default config to atarixl-xex for C programs

## [0.0.16] - 2020-01-26

- fix library link dir

## [0.0.15] - 2020-01-26

- fix default label to match tgi header

## [0.0.14] - 2020-01-26

- add support for defining the label/variable name of the statically linked driver

## [0.0.13] - 2020-01-26

- add support for static linking of tgi driver

## [0.0.12] - 2020-01-25

- add linker options back in

## [0.0.11] - 2020-01-25

- change to long form version of command line arguments for self-documentation of batch command

## [0.0.10] - 2020-01-22

- fix output file names of label and debug files

## [0.0.9] - 2020-01-22

- ???

## [0.0.8] - 2020-01-22

- Added build output dir
- Modified stand alone build command to output to build dir
- Added launch emulator
- Added quick config for Altirra
- Added customizable extension for build target
- Added clean command to delete files in build dir
- Added StatusBarItem for common actions

## [0.0.3] - 2019-12-31

- more settings tweaks - renaming/reorganizing
- add quick config for common emulator settings
- added quick config support for Altirra
- added launch emulator for just starting the configured emulator

## [0.0.2] - 2019-12-30

- minor settings tweaks

## [0.0.1] - 2019-12-29

- Initial version
- TODO: implement support for launching emulator
- TODO: implement support for make file usage
- TODO: implement run behavior
- TODO: add build directory for output
