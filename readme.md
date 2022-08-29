## About

This is a tool for Windows that can crop wide screenshots to the HD size. Just drag and drop your files on the bat file, and they will be cropped.

## Usage

1. Clone the project using `git clone`
2. Install dependencies using `yarn` command
3. To crop your files, you can drag and drop them on `crop_left_hd.bat` or `crop_right_hd.bat`
4. For convenience you can create a shortcut on your desktop to the bat file and drag the images on this shortcut
    - Shortcut can be created by dragging the bat file onto the desktop with the `alt` key pressed.

![](cropping.gif)

## Settings

In the bat file there some parameters that can be adjusted:

| Parameter          | Position                                                                        | Description                                                                                                                                                                                                           | Available values                |
| ------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| preset             | Second argument in the batch file: `node "%~dp0index.js" CROP_HD_RIGHT safe %*` | Preset name from `consts.js`. Left HD and right HD crops are supported. Right HD crop will work with images of size 3840x1080 or more.                                                                                | `CROP_HD_LEFT`, `CROP_HD_RIGHT` |
| image replace mode | Third argument in the batch file: `node "%~dp0index.js" CROP_HD_RIGHT safe %*`  | When set to `safe`, copy of the file will be created for each file in the project temp folder. So when cropped something incorrectly, the backup file will be available. Set to `unsafe` for disabling image backups. | `safe`, `unsafe`                |
| pause              | At the bottom of the batch file                                                 | Remove or comment it out if you don't need the terminal window with results and logs to stay after the operation.                                                                                                     | `pause`, `@REM pause`           |

## Motivation

I have a lot of screenshots that contain the entire two screens, when in fact I only need the left or the right side of the screenshot.

This could potentially be solved with some auto actions/scripts for image editing software, such as Photoshop, but the solution required to exclude heavy programs and any 'Save file' prompts.

It would be really convenient if I had some script or tool that I could drop my screenshots on and get them cropped. So I've developed this.
