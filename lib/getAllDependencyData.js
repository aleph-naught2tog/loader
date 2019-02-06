const fs = require('fs');
const path = require('path');
const fileUtils = require('./file_utils');

exports.getAllDependencyData = getAllDependencyData;
function getAllDependencyData(nodeModules, assetLookup, mainLoopup) {
  const { dependencies } = parsePackageJson('', false);
  const packageNames = Object.keys(dependencies);
  for (const dependencyName of packageNames) {
    const modulePath = path.join(nodeModules, dependencyName);
    const {
      dependencies: moduleDependencies,
      main: moduleMain,
      assets
    } = parsePackageJson(dependencyName);
    if (assets) {
      const assetListing = [];
      for (const assetFilePath of assets) {
        assetListing.push(path.join(modulePath, assetFilePath));
      }
      assetLookup[dependencyName] = assetListing;
    }
    mainLoopup[dependencyName] = path.join(modulePath, moduleMain);
  }
}

function parsePackageJson(moduleName = '', nodeModule = true) {
  const contextPath = nodeModule
    ? path.join(process.cwd(), 'node_modules')
    : '';
  const folderPath = path.join(contextPath, moduleName);
  const packageJsonPath = path.join(folderPath, 'package.json');
  return JSON.parse(fileUtils.readFile(packageJsonPath));
}

exports.writeMainFiles = writeMainFiles;
function writeMainFiles(mainIndex, vendorFolder) {
  for (const folderNameAsKey in mainIndex) {
    const mainFileAsValue = mainIndex[folderNameAsKey];
    const dependencyFileData = fileUtils.readFile(mainFileAsValue);
    const outputFolder = path.join(vendorFolder, folderNameAsKey);
    fileUtils.writeFile(
      path.join(outputFolder, 'index.js'),
      dependencyFileData
    );
  }
}

exports.copyAssets = copyAssets;
function copyAssets(assetIndex, vendorFolder) {
  for (const folderNameAsKey in assetIndex) {
    const assetFileList = assetIndex[folderNameAsKey];
    const outputFolder = path.join(vendorFolder, folderNameAsKey, 'assets');

    fileUtils.makeFolderIfNotExists(outputFolder);

    for (const assetFileNameAsValue of assetFileList) {
      fs.copyFileSync(
        assetFileNameAsValue,
        path.join(outputFolder, path.basename(assetFileNameAsValue))
      );
    }
  }
}

exports.processData = processData;
function processData(mainLookup) {
  return function(inputFileData) {
    const lines = inputFileData.split(/(\r?\n)/g);
    const returnLines = [];

    for (const line of lines) {
      if (!line.includes('import')) {
        returnLines.push(line);
        continue;
      }

      const matches = /^import(.+?)from(.+?);?$/.exec(line);
      if (matches === null) {
        returnLines.push(line);
        continue;
      }

      const [_wholeMatch, what, where] = matches;
      const sansQuotes = where.trim().slice(1, -1);

      if (sansQuotes in mainLookup) {
        const newImport = what.replace(/\*\s+as\s+(\w+)/, '$1');
        returnLines.push(`const${newImport}= require(${where.trim()});`);
      } else {
        returnLines.push(line);
      }
    }

    return returnLines.join('');
  };
}

