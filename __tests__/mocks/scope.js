function Scope(scopeName) {
  let localScope = {};
  let loadedModules = {};

  this.name = scopeName;
  this.exports = {};

  this.link = someModule => {
    loadedModules[someModule.name] = someModule;
  };

  this.accessVariable = variableName => {
    if (variableName in localScope) {
      return localScope[variableName];
    }

    throw new Error(`[fake] ReferenceError: ${variableName} is not defined.`);
  };

  this.declareAssignVariable = (variableName, variableValue) => {
    if (variableName in localScope) {
      throw new Error(`[fake] ${variableName} has already been defined.`);
    }

    localScope[variableName] = variableValue;
  };

  this.assignVariable = (variableName, variableValue) => {
    if (variableName in localScope) {
      localScope[variableName] = variableValue;
      return;
    }

    throw new Error(`[fake] ReferenceError: ${variableName} is not defined.`);
  };

  this.declareVariable = variableName => {
    if (variableName in localScope) {
      throw new Error(`[fake] Cannot redeclare ${variableName}.`);
    }

    localScope[variableName] = undefined;
  };

  this.export = (key, value) => {
    this.exports[key] = value;
  };

  this.require = key => {
    if (key in loadedModules) {
      return loadedModules[key].exports;
    } else {
      throw new Error(`[fake] ModuleReferenceError: ${key} is not defined.`);
    }
  };

  this.peek = () => {
    console.group('localScope');
    console.log(localScope);
    console.groupEnd();

    console.group('loadedModules');
    console.log(loadedModules);
    console.groupEnd();

    console.group('exports');
    console.log(this.exports);
    console.groupEnd();
  };
}

module.exports = {
  Scope: Scope
};
