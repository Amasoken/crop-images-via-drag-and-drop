@echo off

@REM 1. node app_folder/index.js - starts the app
@REM 2. [preset] - CROP_HD_LEFT or CROP_HD_RIGHT
@REM 3. [image replace mode] - safe or unsafe
@REM 4. [directory parse mode] - imageOnly or withDirectories
@REM 5. [recursive] - recursive or notRecursive
@REM 6. [dropped files] - any files you dropped on the bat. Should be folders, png or jpg images

node "%~dp0index.js"^
 --preset=CROP_HD_LEFT^
 --mode=safe^
 --parseDirectories=withDirectories^
 --isRecursive=recursive^
 %*

if errorlevel 1 pause
