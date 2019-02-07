const path = require('path');
const fileUtils = require('./file_utils');

// this is the root of the *project being built*
const PROJECT_ROOT = path.join(process.cwd(), 'demo_project');

const root = {};
process.chdir(PROJECT_ROOT);
for (const f of fileUtils.walkFileTree('.', root)) {
  console.log(f);
}
// console.log(root);

// const {
//   getAllDependencyData,
//   processData,
//   copyAllDependenciesToVendorFolder,
//   copyAllAssetsToVendorFolder
// } = require('./getAllDependencyData');


// const PUBLIC_FOLDER = path.join(PROJECT_ROOT, 'public');
// const SOURCE_FOLDER = path.join(PROJECT_ROOT, 'src');
// const BUILD_FOLDER = path.join(PROJECT_ROOT, 'build');

// const BUILD_SOURCE_FOLDER = path.join(BUILD_FOLDER, 'src');
// const VENDOR_FOLDER = path.join(BUILD_FOLDER, 'vendor');

// const fs = require('fs');
// fileUtils.makeFolderIfNotExists(BUILD_FOLDER, fs);
// fileUtils.makeFolderIfNotExists(VENDOR_FOLDER, fs);

// getAllDependencyData(PROJECT_ROOT);
// fileUtils.copyOverFiles(SOURCE_FOLDER, BUILD_SOURCE_FOLDER, processData);
// fileUtils.copyOverFiles(PUBLIC_FOLDER, BUILD_FOLDER);
// copyAllDependenciesToVendorFolder(VENDOR_FOLDER);
// copyAllAssetsToVendorFolder(VENDOR_FOLDER);
