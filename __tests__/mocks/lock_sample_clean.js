function moduleWithDependencies() {
  // commonlyRequiredModule
  // topLevelWrongVersionModule
}

function commonlyRequiredModule() {
  // moduleWithNoDependencies
}

function topLevelWrongVersionModule() {

}

function moduleWithNoDependencies() {

}

const after = {
  name: 'demo_project',
  dependencies: {
    moduleWithDependencies: {
      version: "idk",
      requires: {
        commonlyRequiredModule: "wheee",
        topLevelWrongVersionModule: "too-small"
      },
      dependencies: {
        topLevelWrongVersionModule: {
          version: "too-small"
        }
      }
    },
    moduleWithNoDependencies: {
      version: "idk"
    },
    commonlyRequiredModule: {
      version: 'wheee',
      requires: {
        moduleWithNoDependencies: "idk"
      }
    },
    topLevelWrongVersionModule: {
      version: 'too-big'
    }
  }
};
