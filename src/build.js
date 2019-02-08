const path = require('path');
const fileUtils = require('./file_utils');

// this is the root of the *project being built*
const PROJECT_ROOT = path.join(process.cwd(), 'demo_project');

const tree = require('./tree');

process.chdir(PROJECT_ROOT);
function processPackageLock(where) {
  const fs = require('fs');
  const lockJson = JSON.parse(fs.readFileSync('package-lock.json'));
  const result = tree.unrollDepthFirst(lockJson, {
    reject: {
      integrity: true,
      version: true,
      resolved: true,
      bundled: true
    },
    fail: [item => item.dev || item.optional]
  });
  const filtered = result.filter(str => str !== 'requires').filter(str => str !== 'dependencies');
  console.log(result.length, filtered, filtered.length);

  // const ordred = [...Object.entries(result)];
  // ordred.sort(([v, x], [u, y]) => y - x);
  // console.log(ordred);
}
processPackageLock('.');

// console.log(lockJson)
// const root = {};
// for (const f of fileUtils.walkFileTree('.', root)) {
//   // console.log(f);
// }
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
