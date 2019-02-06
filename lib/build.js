const path = require('path');

const {
  getAllDependencyData,
  processData,
  writeMainFiles,
  copyAssets
} = require('./getAllDependencyData');

const fileUtils = require('./file_utils');

const CWD = process.cwd();

const MAIN_LOOKUP = {};
const ASSET_LOOKUP = {};

const PUBLIC_FOLDER = path.join(CWD, 'public');
const SOURCE_FOLDER = path.join(CWD, 'src');
const NODE_MODULES = path.join(CWD, 'node_modules');

const BUILD_FOLDER = path.join(CWD, 'build');
const VENDOR_FOLDER = path.join(BUILD_FOLDER, 'vendor');
fileUtils.makeFolderIfNotExists(BUILD_FOLDER);
fileUtils.makeFolderIfNotExists(VENDOR_FOLDER);

getAllDependencyData(NODE_MODULES, ASSET_LOOKUP, MAIN_LOOKUP);
fileUtils.copyOverFiles(
  SOURCE_FOLDER,
  path.join(BUILD_FOLDER, 'src'),
  processData(MAIN_LOOKUP)
);
fileUtils.copyOverFiles(PUBLIC_FOLDER, BUILD_FOLDER);
writeMainFiles(MAIN_LOOKUP, VENDOR_FOLDER);
copyAssets(ASSET_LOOKUP, VENDOR_FOLDER);
