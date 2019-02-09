import path from 'path';
import * as fileUtils from './file_utils';
import * as fs from 'fs';
import { processPackageLock } from './processPackageLock';

// this is the root of the *project being built*
const PROJECT_ROOT = path.join(process.cwd(), 'demo_project');

process.chdir(PROJECT_ROOT);

const processedLockFile = processPackageLock({
  emitUpOneAndSkip: {
    version: true
  },
  reject: {
    // the "true" here is just a placeholder; what we really want are the keys
    integrity: true,
    resolved: true,
    bundled: true
  },
  descendAndSkipKeyEmit: {
    dependencies: true
    // requires: true
  },
  fail: [item => item.dev]
});
console.log(processedLockFile);

const lockJson = JSON.parse(
  fs.readFileSync('package-lock.json', { encoding: 'utf8' })
);
console.log(lockJson);
const root = {};
for (const f of fileUtils.walkFileTree('.', root)) {
  // console.log(f);
}
console.log(require('util').inspect(root, true, Infinity, true));

const {
  getAllDependencyData,
  processData,
  copyAllDependenciesToVendorFolder,
  copyAllAssetsToVendorFolder
} = require('./getAllDependencyData');

const PUBLIC_FOLDER = path.join(PROJECT_ROOT, 'public');
const SOURCE_FOLDER = path.join(PROJECT_ROOT, 'src');
const BUILD_FOLDER = path.join(PROJECT_ROOT, 'build');

const BUILD_SOURCE_FOLDER = path.join(BUILD_FOLDER, 'src');
const VENDOR_FOLDER = path.join(BUILD_FOLDER, 'vendor');

fileUtils.makeFolderIfNotExists(BUILD_FOLDER, fs);
fileUtils.makeFolderIfNotExists(VENDOR_FOLDER, fs);

getAllDependencyData(PROJECT_ROOT);
fileUtils.copyOverFiles(SOURCE_FOLDER, BUILD_SOURCE_FOLDER, processData);
fileUtils.copyOverFiles(PUBLIC_FOLDER, BUILD_FOLDER);
copyAllDependenciesToVendorFolder(VENDOR_FOLDER);
copyAllAssetsToVendorFolder(VENDOR_FOLDER);
