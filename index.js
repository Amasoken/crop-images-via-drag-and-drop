const chalk = require('chalk');
const { createTempFolder, handleCrop } = require('./src/cropImage.js');
const { parseArgs } = require('./src/parseArgs.js');
const { MODES, TEMP_FOLDER_PATH } = require('./src/consts.js');

const { preset, split, mode, parseDirectories, isRecursive, fileList } = parseArgs();

preset && console.log('Cropping dropped images from coordinates', preset.slice(0, 2), 'until', preset.slice(2));
split && console.log('Splitting dropped images by', split);

if (mode === MODES.safe) console.log('Backups of the cropped images will be stored in', TEMP_FOLDER_PATH);
else console.log('No backup images will be stored');

console.log('\n=====');

const cropImages = async () => {
    createTempFolder();
    let success = 0,
        skipped = 0,
        errors = 0;

    for (const path of fileList) {
        const [successCount, skippedCount, errorCount] = await handleCrop(
            path,
            preset || split,
            parseDirectories,
            isRecursive,
            mode,
        );

        success += successCount;
        skipped += skippedCount;
        errors += errorCount;
    }

    console.log(chalk.green('Cropped'), success);
    if (skipped) console.log(chalk.blueBright('Skipped'), skipped);
    if (errors) console.log(chalk.red('Errors:'), errors);
    if (skipped || errors) process.exit(1);
};

cropImages();
