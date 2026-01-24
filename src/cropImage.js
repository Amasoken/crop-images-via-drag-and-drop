const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { MODES, TEMP_FOLDER_PATH } = require('./consts.js');

const regExp = /.+\.(png|jpg|jpeg)/;

const createTempFolder = (path = TEMP_FOLDER_PATH) => {
    try {
        fs.accessSync(path, fs.constants.F_OK);
    } catch (error) {
        console.log('Creating temp directory:', path);
        fs.mkdirSync(path);
    }
};

const handleCrop = async (fileOrFolder, presetOrSplit, parseDirectories, isRecursive, mode, depth = 0) => {
    let success = 0,
        skipped = 0,
        errors = 0;

    const stats = fs.lstatSync(fileOrFolder);
    if (stats.isFile() && regExp.test(fileOrFolder)) {
        const result = await cropImage(fileOrFolder, presetOrSplit, mode);

        if (result) success++;
        else if (result === null) skipped++;
        else errors++;
    } else if (stats.isDirectory() && parseDirectories) {
        if (!isRecursive && depth > 0) {
            console.log(chalk.blueBright('Non recursive mode, skipping folder ') + chalk.yellow(fileOrFolder));
            console.log('=====');
            return [0, 0, 0];
        }

        console.log(chalk.yellow(fileOrFolder) + '\n---');
        const files = fs.readdirSync(fileOrFolder);

        for (const filePath of files) {
            const [successCount, skippedCount, errorCount] = await handleCrop(
                path.join(fileOrFolder, filePath),
                presetOrSplit,
                parseDirectories,
                isRecursive,
                mode,
                depth + 1
            );

            success += successCount;
            skipped += skippedCount;
            errors += errorCount;
        }
    }

    return [success, skipped, errors];
};

const cropImage = async (file, presetOrSplit, mode = 'safe') => {
    const [x, y, width, height] = presetOrSplit;
    const isSplit = !width && !height;

    console.log(chalk.green(file));

    const { width: imageWidth, height: imageHeight } = await sharp(file).metadata();

    const needsCropX = width < imageWidth;
    const needsCropY = height < imageHeight;

    if (!isSplit && !needsCropX && !needsCropY) {
        console.log(
            'The image size',
            [imageWidth, imageHeight],
            'is less or equal to the crop size',
            [width, height],
            '\n'
        );
        console.log(chalk.blueBright('Skipped.') + '\n=====');

        return null;
    }

    const xValid = x >= 0 && x <= imageWidth && x + width <= imageWidth;
    const yValid = y >= 0 && y <= imageHeight && y + height <= imageHeight;

    // if (!xValid || !yValid) {

    if (!isSplit && (!xValid || !yValid)) {
        console.log(
            "Can't crop the image of a size ",
            [imageWidth, imageHeight],
            'to the specified coordinates from',
            [x, y],
            'until',
            [width, height]
        );

        console.log(chalk.red('\nError:'), 'Out of bounds\n=====');

        return false;
    }

    if (mode === MODES.safe) {
        const fileNameSplit = file.split(/\\|\//);
        const fileName = fileNameSplit[fileNameSplit.length - 1];
        const backupName = path.join(TEMP_FOLDER_PATH, Date.now() + '_backup_' + fileName);

        console.log('Creating image backup', backupName);
        fs.copyFileSync(file, backupName);
    }

    console.log('Cropping source image\n');

    if (isSplit) {
        const splitWidth = imageWidth / x;
        const splitHeight = imageHeight / y;

        let counter = 1;

        for (let j = 0; j < y; j++) {
            for (let i = 0; i < x; i++) {
                if (
                    !(await executeCrop(
                        file,
                        i * splitWidth,
                        j * splitHeight,
                        splitWidth,
                        splitHeight,
                        String(counter++).padStart(3, '0')
                    ))
                ) {
                    return false;
                }
            }
        }

        return true;
    } else {
        return await executeCrop(file, x, y, width, height);
    }
};

async function executeCrop(file, x, y, width, height, suffix) {
    let output = file;
    if (suffix) {
        const name = file.split('.');
        const ext = name.pop();

        output = [...name, suffix, ext].join('.');
    }

    return await sharp(file)
        .withMetadata()
        .extract({ left: x, top: y, width, height })
        .toBuffer()
        .then((buffer) => sharp(buffer).toFile(output)) // a hack to save into the same file
        .then(() => {
            console.log(chalk.green('Success.'));

            return true;
        })
        .catch((error) => {
            console.log(chalk.red('Error:'), error.message);

            return false;
        })
        .finally(() => {
            console.log('=====');
        });
}

module.exports = { createTempFolder, handleCrop };
