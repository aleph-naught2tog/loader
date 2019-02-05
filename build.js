/* version 1 */
const fs = require('fs');
const path = require('path');

const getDependencies = (moduleName = '', nodeModule = true) => {
  try {
    const contextPath = nodeModule
      ? path.join(process.cwd(), 'node_modules')
      : '';

    const folderPath = path.join(contextPath, moduleName);
    const packageJsonPath = path.join(folderPath, 'package.json');

    const packageJson = fs.readFileSync(packageJsonPath, { encoding: 'utf8' });
    const { dependencies, main } = JSON.parse(packageJson);
    return { dependencies, main };
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const BUILD_FOLDER = path.join(process.cwd(), 'build');
const NODE_MODULES = path.join(process.cwd(), 'node_modules');

const { dependencies, main } = getDependencies('', false);
if (!dependencies) {
  console.error('No dependencies found -- CLEARLY an error?');
  process.exit(1);
}
// console.log('dependencies', dependencies);

const folderNames = Object.keys(dependencies);
console.log('folderNames', folderNames);

// since these got shoved into the registry at all
// I thiiiiiiiiiiiiiiiiiiiiink we can assume
//      they have a main? and a package.json?
// and if not I'm okay failing them

const masterDependencyListOfNames = new Set(folderNames);
const mainFileLookup = {};
for (const folder of folderNames) {
  const modulePath = path.join(process.cwd(), 'node_modules', folder);
  const {
    dependencies: moduleDependencies,
    main: moduleMain
  } = getDependencies(folder);

  if (moduleDependencies) {
    Object.keys(moduleDependencies).forEach(additionalModule => {
      masterDependencyListOfNames.add(additionalModule);
    });
  }

  mainFileLookup[folder] = path.join(modulePath, moduleMain);
}

console.log(mainFileLookup)
