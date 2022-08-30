const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');
const { MODES, TEMP_FOLDER_PATH } = require('./consts');

const regExp = /.+\.(png|jpg|jpeg)/;

const createTempFolder = (path = TEMP_FOLDER_PATH) => {
    try {
        fs.accessSync(path, fs.constants.F_OK);
    } catch (error) {
        console.log('Creating temp directory:', path);
        fs.mkdirSync(path);
    }
};

const handleCrop = async (fileOrFolder, preset, parseDirectories, isRecursive, mode, depth = 0) => {
    let success = 0,
        errors = 0;

    const stats = fs.lstatSync(fileOrFolder);
    if (stats.isFile() && regExp.test(fileOrFolder)) {
        if (await cropImage(fileOrFolder, preset, mode)) {
            success++;
        } else {
            errors++;
        }
    } else if (stats.isDirectory() && parseDirectories) {
        if (!isRecursive && depth > 0) {
            console.log('Non recursive mode, skipping folder ' + fileOrFolder + '\n=====');
            return [0, 0];
        }

        console.log('Parsing folder', fileOrFolder + '\n---');
        const files = fs.readdirSync(fileOrFolder);

        for (const filePath of files) {
            const [successCount, errorCount] = await handleCrop(
                path.join(fileOrFolder, filePath),
                preset,
                parseDirectories,
                isRecursive,
                mode,
                depth + 1
            );

            errors += errorCount;
            success += successCount;
        }
    }

    return [success, errors];
};

const cropImage = async (file, preset, mode = safe) => {
    const [x, y, width, height] = preset;

    console.log('Cropping file', file);

    return Jimp.read(file)
        .then((image) => {
            const imageWidth = image.getWidth();
            const imageHeight = image.getHeight();

            const needsCropX = width < imageWidth;
            const needsCropY = height < imageHeight;

            if (!needsCropX && !needsCropY) {
                console.log('Skipped. The image size', [imageWidth, imageHeight], 'is less or equal to the crop size', [
                    width,
                    height,
                ]);

                return false;
            }

            const xValid = x >= 0 && x <= imageWidth && x + width <= imageWidth;
            const yValid = y >= 0 && y <= imageHeight && y + height <= imageHeight;

            if (!xValid || !yValid) {
                console.log(
                    "Can't crop the image of a size ",
                    [imageWidth, imageHeight],
                    'to the specified coordinates from',
                    [x, y],
                    'until',
                    [width, height]
                );

                throw new Error('Out of bounds');
            }

            if (mode === MODES.safe) {
                const fileNameSplit = file.split(/\\|\//);
                const fileName = fileNameSplit[fileNameSplit.length - 1];
                const backupName = path.join(TEMP_FOLDER_PATH, Date.now() + '_backup_' + fileName);

                console.log('Moving image to', backupName);
                fs.copyFileSync(file, backupName);
            }

            image.crop(...preset).write(file);
            console.log('\nSuccess.');

            return true;
        })
        .catch((error) => {
            console.log('\nError:', error.message);

            return false;
        })
        .finally(() => {
            console.log('=====');
        });
};

module.exports = { createTempFolder, handleCrop };
