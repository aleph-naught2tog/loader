const path = require('path');

const {
  getAllDependencyData,
  processData,
  copyAllDependenciesToVendorFolder,
  copyAllAssetsToVendorFolder
} = require('./getAllDependencyData');

const fileUtils = require('./file_utils');

const CWD = process.cwd();

const PUBLIC_FOLDER = path.join(CWD, 'public');
const SOURCE_FOLDER = path.join(CWD, 'src');
const NODE_MODULES = path.join(CWD, 'node_modules');
const BUILD_FOLDER = path.join(CWD, 'build');

const BUILD_SOURCE_FOLDER = path.join(BUILD_FOLDER, 'src');
const VENDOR_FOLDER = path.join(BUILD_FOLDER, 'vendor');

const fs = require('fs');
fileUtils.makeFolderIfNotExists(BUILD_FOLDER, fs);
fileUtils.makeFolderIfNotExists(VENDOR_FOLDER, fs);

getAllDependencyData(NODE_MODULES);
fileUtils.copyOverFiles(SOURCE_FOLDER, BUILD_SOURCE_FOLDER, processData);
fileUtils.copyOverFiles(PUBLIC_FOLDER, BUILD_FOLDER);
copyAllDependenciesToVendorFolder(VENDOR_FOLDER);
copyAllAssetsToVendorFolder(VENDOR_FOLDER);
