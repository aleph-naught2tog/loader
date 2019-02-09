const { Scope } = require('./scope');


function moduleWithDependencies() {
  // commonlyRequiredModule
  // topLevelWrongVersionModule
  const scope = new Scope('moduleWithDependencies');
  function innerFunction() {
    const { doSomething } = scope.require('commonlyRequiredModule');
    const { wave } = scope.require('topLevelWrongVersionModule');
    console.log('message in moduleWithDeps from common: ', doSomething());
    console.log('message in modulewithdeps from top: ', wave());
  }

  scope.exports = {
    fancyFunction: innerFunction
  };

  return scope;
}

function commonlyRequiredModule() {
  // moduleWithNoDependencies
  const scope = new Scope('commonlyRequiredModule');
  function innerFunction() {
    const { sayHello } = scope.require('moduleWithNoDependencies');
    console.log('message in common, from noDeps: ', sayHello());

    return 'snap crackle pop';
  }

  scope.exports = {
    doSomething: innerFunction
  };

  return scope;
}

function topLevelWrongVersionModule() {
  const scope = new Scope('topLevelWrongVersionModule');
  scope.exports = {
    wave: () => 'do the wave!'
  };
  return scope;
}

function moduleWithNoDependencies() {
  const scope = new Scope('moduleWithNoDependencies');
  scope.exports = {
    sayHello: () => 'hello'
  };
  return scope;
}

const fakeProject = {
  name: 'fake_project',
  dependencies: {
    moduleWithDependencies: {
      version: 'idk',
      requires: {
        commonlyRequiredModule: 'wheee',
        topLevelWrongVersionModule: 'too-small'
      },
      dependencies: {
        topLevelWrongVersionModule: {
          version: 'too-small'
        }
      }
    },
    moduleWithNoDependencies: {
      version: 'idk'
    },
    commonlyRequiredModule: {
      version: 'wheee',
      requires: {
        moduleWithNoDependencies: 'idk'
      }
    },
    topLevelWrongVersionModule: {
      version: 'too-big'
    }
  }
};

module.exports ={
  fakeProject: fakeProject,
  moduleWithDependencies: moduleWithDependencies,
  moduleWithNoDependencies: moduleWithNoDependencies,
  topLevelWrongVersionModule: topLevelWrongVersionModule,
  commonlyRequiredModule: commonlyRequiredModule
};
