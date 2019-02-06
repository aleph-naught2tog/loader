const path = require('path');
const fs = require('fs');

exports.copyOverFiles = copyOverFiles;
function copyOverFiles(startingFolder, destinationFolder, postReadProcessing) {
  const options = { withFileTypes: true, encoding: 'utf8' };

  const files = fs.readdirSync(startingFolder, options);
  const filteredFiles = files.filter(file => /^[^\.]/.test(file));

  for (const file of filteredFiles) {
    const srcTarget = path.join(startingFolder, file.name);
    const destTarget = path.join(destinationFolder, file.name);

    if (file.isDirectory()) {
      makeFolderIfNotExists(destTarget);
      copyOverFiles(srcTarget, destTarget);
    } else {
      const inputFileData = readFile(srcTarget);
      if (postReadProcessing) {
        writeFile(destTarget, postReadProcessing(inputFileData));
      } else {
        writeFile(destTarget, inputFileData);
      }
    }
  }
}

exports.readFile = readFile;
function readFile(filename) {
  try {
    return fs.readFileSync(filename, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error reading file: ${filename}.`);
    console.error(error);
    process.exit(1);
  }
}

exports.writeFile = writeFile;
function writeFile(filename, data) {
  try {
    makeFolderIfNotExists(path.dirname(filename));
    fs.writeFileSync(filename, data, { flag: 'w+' });
  } catch (error) {
    console.error(`Error writing file: ${filename}.`);
    console.error(error);
    process.exit(1);
  }
}

exports.makeFolderIfNotExists = makeFolderIfNotExists;
function makeFolderIfNotExists(folder) {
  const EEXISTS_ERRNO = -17;
  try {
    fs.mkdirSync(folder);
  } catch (error) {
    if (error.errno && error.errno === EEXISTS_ERRNO) {
      // okay
    } else {
      console.error(error);
      process.exit(1);
    }
  }
}
