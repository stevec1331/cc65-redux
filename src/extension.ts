// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as cp from 'child_process';
import * as path from 'path';

//function buildCommands(context: vscode.ExtensionContext): void;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {

    // all the regular commands
    buildCommands(context);

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "cc65-redux" is now active!');
}

function buildCommands(context: vscode.ExtensionContext): void {

    const cmdStrScriptBuild = 'cc65.script.build';
    const cmdStrScriptBuildCreate = 'cc65.script.build.create';
    const cmdStrScriptClean = 'cc65.script.clean';
    const cmdStrRun = 'cc65.run.program';
    const cmdStrRunEmu = 'cc65.run.emulator';
    const cmdStrMakeBuild = 'cc65.make.build';
    const cmdStrMakeClean = 'cc65.make.clean';
    const cmdStrTest = 'cc65.test';

    let commandScriptBuild = vscode.commands.registerCommand(cmdStrScriptBuild, function () {

        scriptBuild();
    });

    //  define direct build & run commands
    let commandScriptBuildCreate = vscode.commands.registerCommand(cmdStrScriptBuildCreate, function () {

        scriptBuildCreate();
    });

    let commandRun = vscode.commands.registerCommand(cmdStrRun, function () {
        // this should run the program in the emulator
        runProgram();
    });

    let commandRunEmu = vscode.commands.registerCommand(cmdStrRunEmu, function () {
        // this should just launch the emulator
        launchEmulator(false);
    });

    let commandClean = vscode.commands.registerCommand(cmdStrScriptClean, function () {
        // clean command
        cleanScriptBuildOutput();
    });

    // make based commmands

    //  define the build command
    let commandMakeBuild = vscode.commands.registerCommand(cmdStrMakeBuild, function () {

        makeBuild();
    });

    let commandMakeClean = vscode.commands.registerCommand(cmdStrMakeClean, function () {

        makeClean();
    });

    // test command

    let commandTest = vscode.commands.registerCommand(cmdStrTest, function () {
        // show something
        vscode.window.showInformationMessage('cc65 test command to activate from the command palette');
    });

    // commands on status bar
    context.subscriptions.push(commandScriptBuildCreate);
    context.subscriptions.push(commandScriptBuild);
    context.subscriptions.push(commandRun);
    context.subscriptions.push(commandRunEmu);
    context.subscriptions.push(commandClean);
    // regular commands
    context.subscriptions.push(commandMakeBuild);
    context.subscriptions.push(commandMakeClean);
    context.subscriptions.push(commandTest);

    let textThemeColorKey: string = 'statusBarItem.prominentForeground';

    let textColor: vscode.ThemeColor = new vscode.ThemeColor(textThemeColorKey);

    var sbiBuild: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    sbiBuild.command = cmdStrScriptBuild;
    sbiBuild.color = textColor;
    sbiBuild.text = '$(zap) Build';
    sbiBuild.tooltip = 'CC65 Script Build';

    var sbiClean: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    sbiClean.command = cmdStrScriptClean;
    sbiClean.text = '$(clear-all) Clean';
    sbiClean.tooltip = 'CC65 Clean the workspace build dir';
   
    var sbiRun: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
    sbiRun.command = cmdStrRun;
    sbiRun.text = '$(debug-start) Run';
    sbiRun.tooltip = 'CC65 Run built program in emulator';

    var sbiRunEmu: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 97);
    sbiRunEmu.command = cmdStrRunEmu;
    sbiRunEmu.text = '$(vm-running) Emu';
    sbiRunEmu.tooltip = 'CC65 Launch Emulator';

    var sbiMakeBuild: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 96);
    sbiMakeBuild.command = cmdStrMakeBuild;
    sbiMakeBuild.text = '$(package) Make Bld';
    sbiMakeBuild.tooltip = 'CC65 Make Build';

    var sbiMakeClean: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 96);
    sbiMakeClean.command = cmdStrMakeClean;
    sbiMakeClean.text = '$(trashcan) Make Cln';
    sbiMakeClean.tooltip = 'CC65 Make Clean';

    context.subscriptions.push(sbiBuild);
    context.subscriptions.push(sbiClean);
    context.subscriptions.push(sbiRun);
    context.subscriptions.push(sbiRunEmu);

    context.subscriptions.push(sbiMakeBuild);
    context.subscriptions.push(sbiMakeClean);

    let theConfig = vscode.workspace.getConfiguration('cc65');
    let showOnStatusbar = theConfig.get('cc65.vscode.statusbar', true);

    if (showOnStatusbar) {
        sbiBuild.show();
        sbiRun.show();
        sbiRunEmu.show();
        sbiClean.show();
        sbiMakeBuild.show();
        sbiMakeClean.show();
    }

    // $(fold)
    // $(unfold)
}

function getOneConfig(key: string, defaultVal: string, outChannel?: vscode.OutputChannel): string {
    let wsConfig = vscode.workspace.getConfiguration('cc65');
    let v: string = wsConfig.get(key, defaultVal);
    if (outChannel) {
        outChannel.append("\t");
        outChannel.append(key);
        outChannel.append(" = ");
        outChannel.appendLine(v);
    }

    return v;
}

function getOneBooleanConfig(key: string, defaultVal: boolean, outChannel?: vscode.OutputChannel): boolean {
    let wsConfig = vscode.workspace.getConfiguration('cc65');
    let v: boolean = wsConfig.get(key, defaultVal);
    if (outChannel) {
        outChannel.append("\t");
        outChannel.append(key);
        outChannel.append(" = ");
        outChannel.appendLine(v.toString());
    }

    return v;
}

function getCC65Path(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('compilerToolsPath', "C:\\cc65", outChannel || undefined);
}

function getCC65Config(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('cl65.config', "C:\\cc65\\cfg\\atari-xex.cfg", outChannel || undefined);
}

function getCC65Options(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('cc65.options', "", outChannel || undefined);
}

function getCC65CreateDebugInfo(outChannel?: vscode.OutputChannel): boolean {
    return getOneBooleanConfig('createDebugInfo', true, outChannel || undefined);
}

function getLD65Options(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('cl65.options', "", outChannel || undefined);
}

function getCC65Target(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('cl65.target', "atari", outChannel || undefined);
}

function getCC65tgiDriver(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('cl65.tgi.driver', "", outChannel || undefined);
}

function getCC65tgiLabel(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('cl65.tgi.label', "_tgiDrv", outChannel || undefined);
}

function getCC65Extension(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('cl65.extension', "xex", outChannel || undefined);
}

function getCC65BuildOutput(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('env.buildOutput', "build", outChannel || undefined);
}

function getCC65BuildEnv(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('env.build', "windows", outChannel || undefined);
}

function getCC65VSCodeEnv(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('env.vscode', "windows", outChannel || undefined);
}

function getCC65TestEnv(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('env.test', "windows", outChannel || undefined);
}

function getCC65EmulatorPrelaunch(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('emulator.prelaunch', "", outChannel || undefined);
}

function getCC65EmulatorPath(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('emulator.path', "", outChannel || undefined);
}

function getCC65EmulatorOptions(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('emulator.options', "", outChannel || undefined);
}

function getCC65EmulatorQuickConfig(outChannel?: vscode.OutputChannel): string {
    return getOneConfig('emulator.quickConfig', "", outChannel || undefined);
}

function getProgramName(): string {
    // will be based off of the workspace name
    // what if we are not in a workspace?
    var programName: string = vscode.workspace.name!;

    let programNames: string[] = programName.split(" ");
    programName = programNames[0];

    return programName;
}

function dumpConfig(outChannel: vscode.OutputChannel) {
    let configuration = vscode.workspace.getConfiguration('cc65');

    outChannel.appendLine("BEGIN cc65 configuration BEGIN");

    // seems no way to do this automatically, super annoying
    getCC65Path(outChannel);
    getCC65Config(outChannel);
    getCC65Options(outChannel);
    getCC65CreateDebugInfo(outChannel);
    getLD65Options(outChannel);
    getCC65Target(outChannel);
    getCC65tgiDriver(outChannel);
    getCC65tgiLabel(outChannel);
    getCC65Extension(outChannel);
    getCC65BuildOutput(outChannel);
    getCC65BuildEnv(outChannel);
    getCC65VSCodeEnv(outChannel);
    getCC65TestEnv(outChannel);
    getCC65EmulatorPrelaunch(outChannel);
    getCC65EmulatorOptions(outChannel);
    getCC65EmulatorQuickConfig(outChannel);

    outChannel.appendLine("END  cc65 configuration   END");
}

function cleanScriptBuildOutput() {

    let errorCode = 0;

    let outputChannel = vscode.window.createOutputChannel('cc65');
    outputChannel.clear();
    outputChannel.show();
    dumpConfig(outputChannel);

    let buildenv: string = getCC65BuildEnv();
    let vscodeenv: string = getCC65VSCodeEnv();

    // temp - only support windows/windows
    if (buildenv !== "windows" || vscodeenv !== "windows") {
        vscode.window.showErrorMessage('cc65 Only windows for buildenv and vscodeenv is supported right now. Check User Settings.');
        errorCode = -5;
        return errorCode;
    }

    outputChannel.appendLine("Cleaning project build dir...");

    let buildDir: string = getCC65BuildOutput();
    let outputExtension: string = getCC65Extension();

    if (buildDir === '') {
        outputChannel.appendLine("Output build dir not configured.");
        return errorCode;
    }


    let fileseparator: string = "/";
    let rootpath: string = vscode.workspace.rootPath!.trim();


    let outputBuildDir: string = rootpath + fileseparator + buildDir;
    let outputBuildBinDir: string = outputBuildDir + fileseparator + "bin";

    outputChannel.append("Deleting files in OutputBuildDir: ");
    outputChannel.appendLine(outputBuildDir);

    if (!fs.existsSync(outputBuildDir)) {
        outputChannel.appendLine("No output build dir");
        return errorCode;
    }


    // everything in the build dir should be removable... maybe just delete the entire contents

    //vscode.window.showErrorMessage('Clean not implemented yet');
    //fs.rmdirSync(outputBuildDir);

    // remove all files in the intermediate directory
    fs.readdir(outputBuildDir, (err, files) => {
        if (err) {
            throw err;
        }

        for (const file of files) {

            let fullPath: string = path.join(outputBuildDir, file);
            
            // think of a better way to do this
            if (!fullPath.endsWith("bin")) {
                outputChannel.appendLine(fullPath);
            }

            fs.unlink(fullPath, err => {
                if (err) {
                    throw err;
                }
            });
        }
    });

    // remove only the executable type
    fs.readdir(outputBuildBinDir, (err, files) => {
        if (err) {
            throw err;
        }

        for (const file of files) {
            // only delete if it is the executable, .lbl, or .dbg
            let deleteIt : boolean = file.endsWith(outputExtension) || file.endsWith("lbl") || file.endsWith("dbg");

            if (deleteIt) {
                let fullPath: string = path.join(outputBuildBinDir, file);
                outputChannel.appendLine(fullPath);
                fs.unlink(fullPath, err => {
                    if (err) {
                        throw err;
                    }
                });
            }
        }
    });

    return errorCode;
}

function scriptBuild() {

    let errorCode = 0;

    // Check path settings
    let outputChannel = vscode.window.createOutputChannel('cc65');
    outputChannel.clear();
    outputChannel.show();
    dumpConfig(outputChannel);

    let cc65Path: string = getCC65Path();
    let buildenv: string = getCC65BuildEnv();
    let vscodeenv: string = getCC65VSCodeEnv();
    let buildDir: string = getCC65BuildOutput();

    if (cc65Path === "") {
        vscode.window.showErrorMessage('Set cc65 in User Settings.');
        errorCode = -1;
        return errorCode;
    }

    if (!fs.existsSync(cc65Path)) {
        vscode.window.showErrorMessage('cc65 path not found. Check User Settings.');
        errorCode = -2;
        return errorCode;
    }

    let toolExtension: string = "";
    let fileseparator: string = "/";
    let altRootPath: string = vscode.workspace.workspaceFolders![0].uri.fsPath.trim();
    let rootpath: string = vscode.workspace.rootPath!.trim();

    if (altRootPath === rootpath) {
        outputChannel.appendLine("The paths are the same");
    }


    if (buildenv === "linux") {
        rootpath = rootpath.replace("c:", "/mnt/c");
        rootpath = rootpath.replace("d:", "/mnt/d");
        rootpath = rootpath.replace("e:", "/mnt/e");
        rootpath = rootpath.replace("f:", "/mnt/f");
        rootpath = rootpath.replace("g:", "/mnt/g");
        rootpath = rootpath.replace("h:", "/mnt/h");
        rootpath = rootpath.replace("i:", "/mnt/i");
        rootpath = rootpath.replace("j:", "/mnt/j");

        while (rootpath.indexOf("\\") > -1) {
            rootpath = rootpath.replace("\\", "/");
        }
    } else {
        fileseparator = "\\";
        toolExtension = ".exe";
    }

    let command = "powershell.exe";
    let scriptExt = '.sh';

    if (buildenv === "linux" && vscodeenv === "linux") {
        command = "bash";
    } else if (buildenv === "linux" && vscodeenv === "windows") {
        command = "powershell.exe";
    } else if (buildenv === "windows" && vscodeenv === "windows") {
        command = "powershell.exe";
    } else {
        vscode.window.showErrorMessage('cc65 build env misconfigured. Check User Settings.');
        errorCode = -3;
        return errorCode;
    }

    // temp - only support windows/windows
    if (buildenv !== "windows" || vscodeenv !== "windows") {
        vscode.window.showErrorMessage('cc65 Only windows for buildenv and vscodeenv is supported right now. Check User Settings.');
        errorCode = -4;
        return errorCode;
    }

    let buildingOnWindows: Boolean = false;
    if (buildenv === "windows") {
        buildingOnWindows = true;
        scriptExt = ".bat";
    }

    // fix up this string literal
    let filename: string = vscode.workspace.rootPath!.trim() + "/cc65_plugin_build" + scriptExt;

    // if the file is not there, we can't do anythhing
    if (!fs.existsSync(filename)) {

        outputChannel.append("Build script file: ");
        outputChannel.appendLine(filename);
        outputChannel.appendLine("Does not exist, build aborted.");
        // exit early with error
        errorCode = -5;
        return errorCode;
    }

    outputChannel.append("Building using buildenv: ");
    outputChannel.append(buildenv);
    outputChannel.append(" vscodenv: ");
    outputChannel.append(vscodeenv);
    outputChannel.appendLine("...");

    let parameters: string[] = [];
    if (command === "powershell.exe") {
        parameters = [
            "\"",
            "./cc65_plugin_build.bat\""
        ];
    } else {
        parameters = [
            "-c",
            "./cc65_plugin_build.sh"
        ];
    }

    // make sure the build dir is there
    let outputBuildDir: string = rootpath + fileseparator + buildDir;
    let outputBinDir: string = outputBuildDir + fileseparator + "bin";
    if (!fs.existsSync(outputBuildDir)) {
        fs.mkdirSync(outputBuildDir);
    }
    if (!fs.existsSync(outputBinDir)) {
        fs.mkdirSync(outputBinDir);
    }

    outputChannel.appendLine("Running build script...");
    outputChannel.append(command);
    outputChannel.append(" ");
    outputChannel.append(parameters.join(" "));
    outputChannel.appendLine("...");

    // this runs the command
    let ca = cp.spawn(command, parameters, {
        detached: false,
        shell: true,
        cwd: vscode.workspace.rootPath!.trim()
    });

    ca.on("close", (e) => {
        outputChannel.appendLine('Child process exit code: ' + e);
        errorCode = e;
        // add config for this
        if (errorCode !== 0) {
            vscode.window.showErrorMessage('Compilation failed with errors.');
        }
    });

    ca.stdout.on('data', function (data) {
        outputChannel.append('' + data);
    });

    ca.stderr.on('data', function (data) {
        outputChannel.append('' + data);
    });

    outputChannel.appendLine("... finished.");

    return errorCode;

}

async function chooseToOverwrite() {

    let qpOptions: vscode.QuickPickOptions = {
        canPickMany: false,
        ignoreFocusOut: true,
        placeHolder: 'Build script already exists. Overwrite?'
    };

    let choices: string[] = ['overwrite', 'cancel'];

    let chosenValue = await vscode.window.showQuickPick(choices, qpOptions);
    return chosenValue;
}

// build the program
async function scriptBuildCreate() {

    let errorCode = 0;

    // Check path settings
    let outputChannel = vscode.window.createOutputChannel('cc65');
    outputChannel.clear();
    outputChannel.show();
    dumpConfig(outputChannel);

    let cc65Path: string = getCC65Path();
    let config: string = getCC65Config();
    let cc65Options: string = getCC65Options();
    let ld65LinkOptions: string = getLD65Options();
    let target: string = getCC65Target();
    let targetExtension: string = getCC65Extension();
    let buildenv: string = getCC65BuildEnv();
    let vscodeenv: string = getCC65VSCodeEnv();
    let buildDir: string = getCC65BuildOutput();
    let tgiDriver: string = getCC65tgiDriver();
    let tgiLabel: string = getCC65tgiLabel();


    let createDebugInfo: boolean = getCC65CreateDebugInfo();

    if (targetExtension === "target") {
        targetExtension = target;
    }

    // will be based off of the workspace name
    // what if we are not in a workspace?
    let programName: string = getProgramName();

    if (cc65Path === "") {
        vscode.window.showErrorMessage('Set cc65 in User Settings.');
        errorCode = -1;
        return errorCode;
    }

    if (!fs.existsSync(cc65Path)) {
        vscode.window.showErrorMessage('cc65 path not found. Check User Settings.');
        errorCode = -2;
        return errorCode;
    }

    let toolExtension: string = "";
    let fileseparator: string = "/";
    let altRootPath: string = vscode.workspace.workspaceFolders![0].uri.fsPath.trim();
    let rootpath: string = vscode.workspace.rootPath!.trim();

    if (altRootPath === rootpath) {
        outputChannel.appendLine("The paths are the same");
    }


    if (buildenv === "linux") {
        rootpath = rootpath.replace("c:", "/mnt/c");
        rootpath = rootpath.replace("d:", "/mnt/d");
        rootpath = rootpath.replace("e:", "/mnt/e");
        rootpath = rootpath.replace("f:", "/mnt/f");
        rootpath = rootpath.replace("g:", "/mnt/g");
        rootpath = rootpath.replace("h:", "/mnt/h");
        rootpath = rootpath.replace("i:", "/mnt/i");
        rootpath = rootpath.replace("j:", "/mnt/j");

        while (rootpath.indexOf("\\") > -1) {
            rootpath = rootpath.replace("\\", "/");
        }
    } else {
        fileseparator = "\\";
        toolExtension = ".exe";
    }

    let cc65Path_bin: string = cc65Path + fileseparator + "bin";
    if (!fs.existsSync(cc65Path_bin)) {
        vscode.window.showErrorMessage('cc65 bin path not found. Check User Settings. Check CC65 install.');
        errorCode = -2;
        return errorCode;
    }

    let cc65Path_targetDir: string = cc65Path + fileseparator + "target";
    if (!fs.existsSync(cc65Path_targetDir)) {
        vscode.window.showErrorMessage('cc65 target path not found. Check User Settings. Check CC65 install.');
        errorCode = -2;
        return errorCode;
    }

    // if we have a TGI file to link, do the work needed here
    let tgiDriverPath: string = cc65Path + fileseparator + "target" + fileseparator + tgiDriver;
    if (tgiDriver) {
        if (!fs.existsSync(tgiDriverPath)) {
            vscode.window.showErrorMessage('TGI driver file could not be found');
            errorCode = -2;
            return errorCode;
        }

        if (tgiLabel === "") {
            vscode.window.showErrorMessage('TGI driver label not set');
            errorCode = -2;
            return errorCode;
        }
    }

    let command = "powershell.exe";
    let scriptExt = '.sh';

    if (buildenv === "linux" && vscodeenv === "linux") {
        command = "bash";
    } else if (buildenv === "linux" && vscodeenv === "windows") {
        command = "powershell.exe";
    } else if (buildenv === "windows" && vscodeenv === "windows") {
        command = "powershell.exe";
    } else {
        vscode.window.showErrorMessage('cc65 build env misconfigured. Check User Settings.');
        errorCode = -3;
        return errorCode;
    }

    // temp - only support windows/windows
    if (buildenv !== "windows" || vscodeenv !== "windows") {
        vscode.window.showErrorMessage('cc65 Only windows for buildenv and vscodeenv is supported right now. Check User Settings.');
        errorCode = -4;
        return errorCode;
    }

    let buildingOnWindows: Boolean = false;
    if (buildenv === "windows") {
        buildingOnWindows = true;
        scriptExt = ".bat";
    }

    outputChannel.append("Building using buildenv: ");
    outputChannel.append(buildenv);
    outputChannel.append(" vscodenv: ");
    outputChannel.append(vscodeenv);
    outputChannel.appendLine("...");

    var filename = vscode.workspace.rootPath!.trim() + "/cc65_plugin_build" + scriptExt;

    // if the file already exists, ask to overrite
    if (fs.existsSync(filename)) {

        let selectedString = await chooseToOverwrite();

        if (selectedString !== 'overwrite') {
            outputChannel.appendLine("Aborting due to existing script file");
            return 0;
        }

        outputChannel.appendLine("Overwriting existing script file...");
    }


    if (buildenv === "windows") {
        fs.writeFileSync(filename, ":: CC65 Batch file for building\n");
    }
    else {
        fs.writeFileSync(filename, "#!/bin/bash\n");
    }

    var files = [];
    var objectFilesSet: Set<string> = new Set<string>();

    let parameters: string[] = [];
    if (command === "powershell.exe") {
        parameters = [
            "\"",
            "./cc65_plugin_build.bat\""
        ];
    } else {
        parameters = [
            "-c",
            "./cc65_plugin_build.sh"
        ];
    }

    // make sure the build dir is there
    let outputBuildDir: string = rootpath + fileseparator + buildDir;
    if (!fs.existsSync(outputBuildDir)) {
        fs.mkdirSync(outputBuildDir);
    }

    // first command of the script, cd to project dir
    fs.appendFileSync(filename, "cd " + rootpath + "\n");

    // if we have a TGI file to link, do the work needed here
    // since the .s is generated, it should be in the build dir
    let tgiDriverFileName: string = "";
    let tgiDriverAssemblerFile: string = "";
    if (tgiDriver) {

        outputChannel.appendLine("Converting loadable driver to linked driver...");
        tgiDriverFileName = path.parse(tgiDriverPath).name;
        tgiDriverAssemblerFile = buildDir + fileseparator + tgiDriverFileName + ".s";
        // add the command to make the driver static image
        fs.appendFileSync(filename,
            cc65Path_bin + fileseparator + "co65" + toolExtension +
            " --code-label " + tgiLabel +
            " " + tgiDriverPath +
            " -o " + tgiDriverAssemblerFile +
            "\n", "utf8");

        let symbolName: string = tgiLabel.slice(1);

        outputChannel.append("Make sure to declare the proper variable in source code: extern void ");
        outputChannel.append(symbolName);
        outputChannel.appendLine("[];");
        outputChannel.appendLine("And corresponding tgi_install() call.");
    }


    // This might be better to be a task instead of like this...
    vscode.workspace.findFiles("src/**/*.c", "", 1000)
        .then(
            (result) => {
                // this section is for compiling .c files into .s files and then generating .o files
                files = result;
                for (var index in files) {
                    var oneFile = files[index].path.substring(files[index].path.indexOf("src/"));

                    let justFilename: string = oneFile.replace("src/", "");

                    if (buildingOnWindows) {
                        oneFile = oneFile.replace("/", "\\");
                    }

                    let pathPrefix: string = ""; // rootpath + fileseparator
                    let compilerResultFile: string = pathPrefix + buildDir + fileseparator + justFilename.replace(".c", ".s");
                    let assembler65ResultFile: string = pathPrefix + buildDir + fileseparator + justFilename.replace(".c", ".o");

                    fs.appendFileSync(filename,
                        cc65Path_bin + fileseparator + "cc65" + toolExtension +
                        " --verbose" +
                        (createDebugInfo ? " --debug-info " : "") +
                        " --target " + target +
                        " " + cc65Options +
                        " " + oneFile +
                        " -o " + compilerResultFile +
                        "\n", "utf8");

                    fs.appendFileSync(filename,
                        cc65Path_bin + fileseparator + "ca65" + toolExtension +
                        " --verbose" +
                        (createDebugInfo ? " --debug-info " : "") +
                        " --target " + target +
                        " " + compilerResultFile +
                        " -o " + assembler65ResultFile +
                        //" " + oneFile.replace(".c",".s") + 
                        "\n", "utf8");

                    objectFilesSet.add(assembler65ResultFile);
                }
            },
            (reason) => {
                console.log(reason);
            }
        ).then(
            () => {
                // this section is for assembling .s files into .o files 
                vscode.workspace.findFiles("src/**/*.s", "", 1000).then(
                    (result) => {
                        files = result;

                        for (var index in files) {
                            var oneFile = files[index].path.substring(files[index].path.indexOf("src/"));

                            let justFilename: string = oneFile.replace("src/", "");

                            if (buildingOnWindows) {
                                oneFile = oneFile.replace("/", "\\");
                            }

                            let pathPrefix: string = ""; // rootpath + fileseparator
                            let assembler65ResultFile: string = pathPrefix + buildDir + fileseparator + justFilename.replace(".s", ".o");

                            fs.appendFileSync(filename,
                                cc65Path_bin + fileseparator + "ca65" + toolExtension +
                                " --verbose" +
                                (createDebugInfo ? " --debug-info " : "") +
                                " --target " + target +
                                " " + oneFile +
                                " -o " + assembler65ResultFile +
                                "\n", "utf8");

                            objectFilesSet.add(assembler65ResultFile);
                        }

                        // add the driver link file
                        if (tgiDriverAssemblerFile) {

                            // remember the what is the output
                            let assemblerTGIdriverResultFile: string = tgiDriverAssemblerFile.replace(".s", ".o");

                            fs.appendFileSync(filename,
                                cc65Path_bin + fileseparator + "ca65" + toolExtension +
                                " --verbose" +
                                (createDebugInfo ? " --debug-info " : "") +
                                " --target " + target +
                                " " + tgiDriverAssemblerFile +
                                " -o " + assemblerTGIdriverResultFile +
                                "\n", "utf8");

                            objectFilesSet.add(assemblerTGIdriverResultFile);
                        }

                    },
                    (reason) => {
                        console.log(reason);
                    }
                ).then(
                    () => {
                        // this section runs the linker to create the .xex
                        var objectFiles: string[] = [];

                        for (let s of objectFilesSet) {
                            objectFiles.push(s);
                        }

                        var allObjectFiles = objectFiles.join(' ');

                        // put everything in the buildDir
                        let prefixpath: string = ""; // rootpath + fileseparator;
                        let progPath: string = prefixpath + buildDir + fileseparator + "bin" + fileseparator + programName + "." + targetExtension;
                        let labelPath: string = prefixpath + buildDir + fileseparator + "bin" + fileseparator + programName + ".lbl";
                        let debugFilepath: string = prefixpath + buildDir + fileseparator + "bin" + fileseparator + programName + ".dbg";

                        //outputChannel.append('' + config);
                        fs.appendFileSync(filename,
                            cc65Path_bin + fileseparator + "ld65" + toolExtension +
                            (config ? " -C " + config : " -t " + target) +
                            (createDebugInfo ? " -Ln " + labelPath : "") +
                            (createDebugInfo ? " --dbgfile " + debugFilepath : "") +
                            " " + (ld65LinkOptions) +
                            " -o " + progPath +
                            " " + allObjectFiles +
                            " " + cc65Path + fileseparator + "lib" + fileseparator + target + ".lib"
                        );
                    });

                outputChannel.appendLine("Build Script created: ");
                outputChannel.appendLine(filename);
            });

    return errorCode;
}


/**
 *  Build the Program with the Make
 */
function makeBuild() {

    let errorCode = 0;

    let outputChannel = vscode.window.createOutputChannel('cc65');
    outputChannel.clear();
    outputChannel.show();
    dumpConfig(outputChannel);

    // Check path settings
    let target = getCC65Target();
    let buildenv = getCC65BuildEnv();
    let vscodeenv = getCC65VSCodeEnv();

    let command = "cmd.exe";

    if (buildenv === "linux" && vscodeenv === "linux") {
        command = "bash";
    } else if (buildenv === "linux" && vscodeenv === "windows") {
        command = "wsl";
    } else if (buildenv === "windows" && vscodeenv === "windows") {
        command = "cmd.exe";
    } else {
        vscode.window.showErrorMessage('cc65 build env misconfigured. Check User Settings.');
        errorCode = -3;
        return errorCode;
    }

    outputChannel.append("Making using buildenv: ");
    outputChannel.append(buildenv);
    outputChannel.append(" vscodenv: ");
    outputChannel.append(vscodeenv);
    outputChannel.append(" target: ");
    outputChannel.append(target);
    outputChannel.appendLine("...");

    let make = cp.spawn(command, [
        "make",
        "CC65_TARGET=" + target
    ], {
        detached: false,
        shell: true,
        cwd: vscode.workspace.rootPath!.trim()
    });

    make.on('close', function (e) {
        outputChannel.appendLine('Child process exit code: ' + e);
        errorCode = e;
        if (e !== 0) {
            vscode.window.showErrorMessage('Compilation failed with errors.');
        }
    });

    make.stdout.on('data', function (data) {
        outputChannel.append('' + data);
    });

    make.stderr.on('data', function (data) {
        outputChannel.append('' + data);
    });

    return errorCode;
}

function makeClean() {

    let errorCode = 0;

    let outputChannel = vscode.window.createOutputChannel('cc65');
    outputChannel.clear();
    outputChannel.show();
    dumpConfig(outputChannel);

    // Check path settings
    let target = getCC65Target();
    let buildenv = getCC65BuildEnv();
    let vscodeenv = getCC65VSCodeEnv();

    let command = "cmd.exe";

    if (buildenv === "linux" && vscodeenv === "linux") {
        command = "bash";
    } else if (buildenv === "linux" && vscodeenv === "windows") {
        command = "wsl";
    } else if (buildenv === "windows" && vscodeenv === "windows") {
        command = "cmd.exe";
    } else {
        vscode.window.showErrorMessage('cc65 build env misconfigured. Check User Settings.');
        errorCode = -3;
        return errorCode;
    }

    outputChannel.append("Cleaning using buildenv: ");
    outputChannel.append(buildenv);
    outputChannel.append(" vscodenv: ");
    outputChannel.append(vscodeenv);
    outputChannel.append(" target: ");
    outputChannel.append(target);
    outputChannel.appendLine("...");

    let make = cp.spawn(command, [
        "make",
        "clean",
        "CC65_TARGET=" + target
    ], {
        detached: false,
        shell: true,
        cwd: vscode.workspace.rootPath!.trim()
    });

    make.on('close', function (e) {
        outputChannel.appendLine('Child process exit code: ' + e);
        errorCode = e;
        if (e !== 0) {
            vscode.window.showErrorMessage('Compilation failed with errors.');
        }
    });

    make.stdout.on('data', function (data) {
        outputChannel.append('' + data);
    });

    make.stderr.on('data', function (data) {
        outputChannel.append('' + data);
    });

    return errorCode;
}

function launchEmulator(launchProgram: boolean) {

    let emulatorOptions = getCC65EmulatorOptions();
    let testenv = getCC65TestEnv();
    let vscodeenv = getCC65VSCodeEnv();
    let quickConfig = getCC65EmulatorQuickConfig();
    let programName: string = getProgramName();
    let targetExtension: string = getCC65Extension();
    //let target: string = getCC65Target();
    let buildDir: string = getCC65BuildOutput();
    let fileseparator: string = "/";

    let emulatorPath: string = getCC65EmulatorPath();

    if (!emulatorPath) {
        vscode.window.showErrorMessage('cc65 emulator path not set. Check User Settings.');
        return;
    }

    if (!fs.existsSync(emulatorPath)) {
        vscode.window.showErrorMessage('cc65 emulator not found. Check User Settings.');
        return;
    }

    if (vscodeenv === "windows") {
        fileseparator = "\\";
    }

    let emulatorName: string = path.basename(emulatorPath, path.extname(emulatorPath));

    let outputChannel = vscode.window.createOutputChannel(emulatorName);
    outputChannel.clear();
    outputChannel.show();
    //dumpConfig(outputChannel);

    let altRootPath: string = vscode.workspace.workspaceFolders![0].uri.fsPath.trim();
    let rootpath: string = vscode.workspace.rootPath!.trim();

    if (altRootPath === rootpath) {
        outputChannel.appendLine("The paths are the same");
    }

    var shell = "powershell.exe";

    if (testenv === "linux" && vscodeenv === "linux") {
        shell = "bash";
    } else if (testenv === "linux" && vscodeenv === "windows") {
        shell = "wsl";
    } else if (testenv === "windows" && vscodeenv === "windows") {
        shell = "powershell.exe";
    } else {
        vscode.window.showErrorMessage('cc65 test env misconfigured. Check User Settings.');
        return;
    }

    if (quickConfig === "altirra") {
        let finalEmulatorOptions: string = "/debug /singleinstance ";

        /*                
                if (target === 'atari') {
                    finalEmulatorOptions += " /defprofile:800 ";
                } else if (target === 'atarixl') {
                    finalEmulatorOptions += " /defprofile:xl ";
                }
        */
        finalEmulatorOptions += " /autoprofile ";

        finalEmulatorOptions += " " + emulatorOptions;

        if (launchProgram) {
            finalEmulatorOptions += " /run " + buildDir + fileseparator + "bin" + fileseparator + programName + "." + targetExtension;
        }
        emulatorOptions = emulatorPath + " " + finalEmulatorOptions;
    } else if (quickConfig === "VICE") {
        vscode.window.showErrorMessage('cc65 VICE not supported via quick config yet. Check User Settings.');
        return;
    } else {
        // if not quick config, then just do the simple thing
        emulatorOptions = emulatorPath + " " + emulatorOptions;
    }

    let params = emulatorOptions.split(" ");

    let emulator = cp.spawn(shell, params, {
        //shell: shell,
        detached: false,
        cwd: rootpath
    });

    emulator.on('close', function (e) {
        outputChannel.appendLine('Child process exit code: ' + e);
        if (e !== 0) {
            vscode.window.showErrorMessage('Emulation failed with errors.');
        }
    });

    emulator.stdout.on('data', function (data) {
        outputChannel.append('' + data);
    });

    emulator.stderr.on('data', function (data) {
        outputChannel.append('' + data);
    });

    emulator.unref();
}

// run the emulator
function runProgram() {

    let emulatorPath: string = getCC65EmulatorPath();

    if (!emulatorPath) {
        vscode.window.showErrorMessage('cc65 emulator path not set. Check User Settings.');
        return;
    }

    if (!fs.existsSync(emulatorPath)) {
        vscode.window.showErrorMessage('cc65 emulator not found. Check User Settings.');
        return;
    }

    let emulatorName: string = path.basename(emulatorPath, path.extname(emulatorPath));
    // change this to be configurable, but for now use Altirra
    let outputChannel = vscode.window.createOutputChannel(emulatorName);
    outputChannel.clear();
    outputChannel.show();
    dumpConfig(outputChannel);

    let testenv = getCC65TestEnv();
    let vscodeenv = getCC65VSCodeEnv();
    let emulatorPrelaunch = getCC65EmulatorPrelaunch();

    // do we actually need this?
    if (emulatorPrelaunch) {
        var prelaunchParameters = emulatorPrelaunch.split(" ");
        var shell = "powershell.exe";

        if (testenv === "linux" && vscodeenv === "linux") {
            shell = "bash";
        } else if (testenv === "linux" && vscodeenv === "windows") {
            shell = "wsl";
        }

        let prelaunch = cp.spawn(shell, prelaunchParameters, {
            detached: false,
            //shell: shell,
            cwd: vscode.workspace.rootPath!.trim()
        });

        prelaunch.on('close', function (e) {
            outputChannel.appendLine('Child process exit code: ' + e);
            if (e !== 0) {
                vscode.window.showErrorMessage('Prelaunch failed with errors.');
            } else {
                launchEmulator(true);
            }
        });

        prelaunch.stdout.on('data', function (data) {
            outputChannel.append('' + data);
        });

        prelaunch.stderr.on('data', function (data) {
            outputChannel.append('' + data);
        });

        prelaunch.unref();
    } else {
        // launch it
        launchEmulator(true);
    }

}

// this method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
    // shouldn't we unregister?
    // how do we remove our commands
}
