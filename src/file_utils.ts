import path from 'path';
import fs from 'fs';

export function cwdTo(somePath: string) {
  return path.join(process.cwd(), somePath);
}

const grabDependencies = folder => {
  const packageJsonPath = path.join(folder, 'package.json');
  const { dependencies } = JSON.parse(
    fs.readFileSync(packageJsonPath, {
      encoding: 'utf8'
    })
  );

  if (dependencies) {
    return Object.keys(dependencies);
  } else {
    return [];
  }
};

export function* walkFileTree(
  startingFolder = '.',
  dependencyTree = {}
) {
  const nodeModulesPath = cwdTo('node_modules');

  const dependencies = grabDependencies(startingFolder);

  for (const dependencyName of dependencies) {
    const newRoot = {}; // root note for this dep
    const dependencyFolder = path.join(nodeModulesPath, dependencyName);
    yield* walkFileTree(dependencyFolder, newRoot);
    dependencyTree[dependencyName] = newRoot;
  }

  yield dependencyTree;
}

export function copyOverFiles(
  startingFolder: string,
  destinationFolder: string,
  postReadProcessing?: (input: string) => string
) {
  let isFolder = true;
  let startingPath = startingFolder;
  let destinationPath = destinationFolder;

  try {
    fs.readdirSync(startingFolder);
    isFolder = true;
  } catch (error) {
    if (error.code === 'ENOTDIR') {
      isFolder = false;
    } else if (error.code === 'ENOENT') {
      const files = fs.readdirSync(path.dirname(startingFolder));
      const maybePath = `${path.basename(startingFolder)}.js`;
      if (files.includes(maybePath)) {
        startingPath = path.join(path.dirname(startingFolder), maybePath);
        isFolder = false;
      } else {
        console.error(startingFolder, files);
        throw error;
      }
    } else {
      throw error;
    }
  } finally {
    if (isFolder) {
      handleFolder(startingPath, destinationPath, postReadProcessing);
    } else {
      handleFile(startingPath, destinationPath, postReadProcessing);
    }
  }
}

function handleFolder(startingFolder, destinationFolder, postReadProcessing) {
  const options: { withFileTypes: true } = { withFileTypes: true };
  const files = fs.readdirSync(startingFolder, options);
  const filteredFiles = files.filter(file => /^[^\.]/.test(file.name));

  for (const file of filteredFiles) {
    const srcTarget = path.join(startingFolder, file.name);
    const destTarget = path.join(destinationFolder, file.name);

    if (file.isDirectory()) {
      makeFolderIfNotExists(destTarget, fs);
      handleFolder(srcTarget, destTarget, postReadProcessing);
    } else {
      handleFile(srcTarget, destTarget, postReadProcessing);
    }
  }
}

function handleFile(srcTarget, destTarget, postReadProcessing?) {
  const inputFileData = readFile(srcTarget);
  if (postReadProcessing) {
    writeFile(destTarget, postReadProcessing(inputFileData));
  } else {
    writeFile(destTarget, inputFileData);
  }
}

export function readFile(filename) {
  return fs.readFileSync(filename, { encoding: 'utf8' });
}

export function writeFile(filename, data) {
  const folder = path.dirname(filename);
  makeFolderIfNotExists(folder, fs);
  fs.writeFileSync(filename, data, { flag: 'w+' });
}

export function makeFolderIfNotExists(folder, { mkdirSync }) {
  try {
    mkdirSync(folder);
  } catch (error) {
    if (error.code && error.code.toUpperCase() === 'EEXIST') {
      // okay
    } else {
      throw error;
    }
  }
}
