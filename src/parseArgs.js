const { PRESETS, MODES, PROCESS_DIRECTORIES, RECURSION_MODE } = require('./consts.js');

const HELP_MESSAGE = `This is an utility for cropping left/right part of the wide images.
You can drop your images on the bat file in the directory root.
For more info please check 'readme.md'

You can create a bat file in the project root with the following contents:

@echo off

@REM 1. node app_folder/index.js - starts the app
@REM 2. [preset] - ${Object.keys(PRESETS).join(' or ')}
@REM 3. [image replace mode] - ${Object.keys(MODES).join(' or ')}
@REM 4. [directory parse mode] - ${Object.keys(PROCESS_DIRECTORIES).join(' or ')}
@REM 5. [recursive] - ${Object.keys(RECURSION_MODE).join(' or ')}
@REM 6. [dropped files] - any files you dropped on the bat. They will appear when you drop them. Should be folders, png or jpg images

node "%~dp0index.js"^
 --preset=CROP_HD_LEFT^
 --mode=safe^
 --parseDirectories=imageOnly^
 --isRecursive=notRecursive^
 %*

pause
`;

const FILE_MESSAGE = `No processable files detected.
You can drag and drop png or jpg images or directories on the bat file for cropping them.
`;

const params = {
    preset: null,
    split: null,
    mode: 'safe',
    parseDirectories: 'imageOnly',
    isRecursive: 'notRecursive',
};

const paramSetter = {
    preset: (value) => PRESETS[value] ?? null,
    split: (value) => value.split(',').map((v) => Number(v)),
    mode: (value) => MODES[value] ?? null,
    parseDirectories: (value) => PROCESS_DIRECTORIES[value] ?? null,
    isRecursive: (value) => RECURSION_MODE[value] ?? null,
    // sourcetExt: (value) => new Set(value.split(',')),
    // renameOriginal: (value) => value.toLowerCase() === 'true',
};

function setParam(name, value) {
    console.log(`Set [${name}] to ${value}`);

    if (name in paramSetter) {
        params[name] = paramSetter[name](value);
    } else if (name in params) {
        params[name] = value;
    } else {
        console.error('Incorrect argument listed:' + name + ';');
        process.exit();
    }
}

function showError(message) {
    console.log(message);
    process.exit();
}

const parseArgs = () => {
    // const [preset, mode, parseDirectories, isRecursive, ...rawFiles] = process.argv.slice(2);
    const args = process.argv.slice(2);

    while (args[0]?.startsWith('--')) {
        const arg = args.shift();
        const [, name, value] = (arg ?? '').split(/--(.*?)=/);

        setParam(name, value);
    }

    const { preset, split, mode, parseDirectories, isRecursive } = params;

    if ((!preset && !split) || !mode || parseDirectories === null || isRecursive === null) {
        console.log('Missing argument. Current arguments:', params);
        showError(HELP_MESSAGE);
    }

    if (!args.length) showError(FILE_MESSAGE);

    return { ...params, fileList: args };
};

module.exports = { parseArgs };
