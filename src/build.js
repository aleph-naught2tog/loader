// this is the root of the *project being built*
const path = require('path');

const PROJECT_ROOT = path.join(process.cwd(), 'demo_project');

const {
  getAllDependencyData,
  processData,
  copyAllDependenciesToVendorFolder,
  copyAllAssetsToVendorFolder
} = require('./getAllDependencyData');

const fileUtils = require('./file_utils');

const PUBLIC_FOLDER = path.join(PROJECT_ROOT, 'public');
const SOURCE_FOLDER = path.join(PROJECT_ROOT, 'src');
const BUILD_FOLDER = path.join(PROJECT_ROOT, 'build');

const BUILD_SOURCE_FOLDER = path.join(BUILD_FOLDER, 'src');
const VENDOR_FOLDER = path.join(BUILD_FOLDER, 'vendor');

const fs = require('fs');
fileUtils.makeFolderIfNotExists(BUILD_FOLDER, fs);
fileUtils.makeFolderIfNotExists(VENDOR_FOLDER, fs);

/*
  TODO:
    if there is no node_modules, run `npm install`
*/

getAllDependencyData(PROJECT_ROOT);
fileUtils.copyOverFiles(SOURCE_FOLDER, BUILD_SOURCE_FOLDER, processData);
fileUtils.copyOverFiles(PUBLIC_FOLDER, BUILD_FOLDER);
copyAllDependenciesToVendorFolder(VENDOR_FOLDER);
copyAllAssetsToVendorFolder(VENDOR_FOLDER);
