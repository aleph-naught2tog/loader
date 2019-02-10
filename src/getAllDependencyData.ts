import fs from 'fs';
import path from 'path';

import * as fileUtils from './file_utils';

const { cwdTo } = fileUtils;

const MAIN_LOOKUP = {};
const ASSET_LOOKUP = {};

export function getAllDependencyData(projectRoot) {
  process.chdir(projectRoot);
  ensureNodeModules();
  const { dependencies } = getRootDependencies();
  const nodeModulesPath = cwdTo('node_modules');
  for (const dependencyName in dependencies) {
    processDependency(nodeModulesPath, dependencyName);
  }
}

function getRootDependencies() {
  return JSON.parse(
    fs.readFileSync(cwdTo('package.json'), {
      encoding: 'utf8'
    })
  );
}

function ensureNodeModules() {
  try {
    fs.readdirSync(cwdTo('node_modules'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      require('child_process').spawnSync('npm', ['install']);
    } else {
      console.error(error);
      throw error;
    }
  }
}

function processDependency(nodeModules, dependencyName) {
  const assetLookup = ASSET_LOOKUP;
  const mainLookup = MAIN_LOOKUP;

  const modulePath = path.join(nodeModules, dependencyName);
  const { dependencies, main, assets, files, browser } = parsePackageJson(
    dependencyName
  );

  if (browser) {
    // prefer browser
  }

  if (dependencies) {
    for (const mod in dependencies) {
      processDependency(nodeModules, mod);
    }
  }

  if (assets) {
    const assetListing = [];

    for (const assetFilePath of assets) {
      const pathToAsset = path.join(modulePath, assetFilePath);
      assetListing.push(pathToAsset);
    }

    if (dependencyName in assetLookup) {
      const existingAssets = assetLookup[dependencyName];
      assetLookup[dependencyName] = existingAssets.concat(assetListing);
    } else {
      assetLookup[dependencyName] = assetListing;
    }
  }

  const fileListing = [];

  if (main) {
    fileListing.push(path.join(modulePath, main));
  } else {
    // no main
  }

  if (files) {
    for (const file of files) {
      const filepath = path.join(modulePath, file);
      fileListing.push(filepath);
    }
  }

  if (dependencyName in mainLookup) {
    const existingFiles = mainLookup[dependencyName];
    const asSet = new Set(existingFiles.concat(fileListing));
    mainLookup[dependencyName] = Array.from(asSet);
  } else {
    mainLookup[dependencyName] = fileListing;
  }
}

function parsePackageJson(moduleName) {
  const contextPath = path.join(process.cwd(), 'node_modules');
  const folderPath = path.join(contextPath, moduleName);
  const packageJsonPath = path.join(folderPath, 'package.json');
  return JSON.parse(fileUtils.readFile(packageJsonPath));
}

export function copyAllDependenciesToVendorFolder(vendorFolder) {
  const mainIndex = MAIN_LOOKUP;

  for (const dependencyName in mainIndex) {
    const dependencyFileListing = mainIndex[dependencyName];
    const vendorOutFolder = path.join(vendorFolder, dependencyName);

    recursivelyCopyDependencies(dependencyFileListing, vendorOutFolder);
  }
}

function recursivelyCopyDependencies(dependencyFileListing, vendorOutFolder) {
  for (const file of dependencyFileListing) {
    const fileName = path.basename(file);
    const outFile = path.join(vendorOutFolder, fileName);
    fileUtils.copyOverFiles(file, outFile);
  }
}

export function copyAllAssetsToVendorFolder(vendorFolder) {
  const assetIndex = ASSET_LOOKUP;
  for (const folderNameAsKey in assetIndex) {
    const assetFileList = assetIndex[folderNameAsKey];
    const assetFolder = path.join(vendorFolder, folderNameAsKey, 'assets');

    copyOverAssets(assetFolder, assetFileList);
  }

  const d = ['window.registry = { '];
  for (const dep in MAIN_LOOKUP) {
    d.push(`"${dep}": {},`);
  }
  d.push("};");
  fs.writeFileSync(path.join(vendorFolder, 'bootstrap.require.js'), d.join(''));
}

function copyOverAssets(assetFolder, assetFileList) {
  fileUtils.makeFolderIfNotExists(assetFolder, fs);

  for (const assetFileNameAsValue of assetFileList) {
    const assetFilename = path.basename(assetFileNameAsValue);
    const outFile = path.join(assetFolder, assetFilename);
    fs.copyFileSync(assetFileNameAsValue, outFile);
  }
}

const NEW_LINES_REGEX = /(\r?\n)/g;

export function processData(inputFileData) {
  const lines = inputFileData.split(NEW_LINES_REGEX);
  const returnLines = [];

  for (const line of lines) {
    returnLines.push(processLine(line));
  }

  return returnLines.join('');
}

const IMPORT_REGEX = /^import(.+?)from(.+?);?$/;
const MAP_AS_TO_CONST_REGEX = /\*\s+as\s+(\w+)/;
const ALIASES_TO_CONST_REGEX = /(\w+)\s+as\s+(\w+)/;

export function getImportData(importStatement) {
  const matches = IMPORT_REGEX.exec(importStatement);

  if (matches) {
    const [_wholeMatch, what, where] = matches;
    const sansQuotes = where.trim().slice(1, -1);

    return {
      packageName: what.trim(),
      path: sansQuotes
    };
  } else {
    return null;
  }
}

export function requireVersionOfImport({ packageName: unmappedPackage, path }) {
  const packageName = unmappedPackage
    .replace(MAP_AS_TO_CONST_REGEX, '$1')
    .replace(ALIASES_TO_CONST_REGEX, '$1: $2')
    .trim();

  return `const ${packageName} = require('${path}');`;
}

function processLine(line) {
  if (!line.includes('import')) {
    return line;
  }

  const matches = getImportData(line);
  if (matches === null) {
    return line;
  }

  if (matches.path in MAIN_LOOKUP) {
    return requireVersionOfImport(matches);
  } else {
    return line;
  }
}
