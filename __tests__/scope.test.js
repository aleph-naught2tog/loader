const { Scope } = require('./mocks/scope');

describe('scope', () => {
  it('should have nothing on creation', () => {
    const scope = new Scope();
    expect(scope.exports).toEqual({});
  });

  it('should throw on accessing undeclared variables', () => {
    const scope = new Scope();
    expect(() => scope.accessVariable('counter')).toThrow();
  });

  it('should allow access values on declareAsigndVariables', () => {
    const scope = new Scope();
    scope.declareAssignVariable('counter', 12);
    expect(scope.accessVariable('counter')).toBe(12);
  });

  it('should not allow redeclaring variables', () => {
    const scope = new Scope();
    scope.declareVariable('counter');
    expect(() => scope.declareVariable('counter')).toThrow();
    expect(() => scope.declareAssignVariable('counter', 12)).toThrow();
  });

  it('should throw on assigning to undeclared variables', () => {
    const scope = new Scope();
    expect(() => scope.assignVariable('counter', 0)).toThrow();
  });

  it('should allow assigning to variables after declaration', () => {
    const scope = new Scope();
    scope.declareVariable('counter');
    expect(() => scope.assignVariable('counter', 10)).not.toThrow();
  });

  it('should assign values', () => {
    const scope = new Scope();
    scope.declareVariable('counter');
    scope.assignVariable('counter', 10);
    expect(scope.accessVariable('counter')).toBe(10);
  });

  it('should allow declaration', () => {
    const scope = new Scope();
    expect(() => scope.accessVariable('counter')).toThrow();
    scope.declareVariable('counter');
    expect(() => scope.accessVariable('counter')).not.toThrow();
  });

  it('should have variables with undefined as value before assignment', () => {
    const scope = new Scope();
    scope.declareVariable('counter');
    expect(() => scope.accessVariable('counter')).not.toThrow();
    expect(scope.accessVariable('counter')).toBeUndefined();
  });
});

describe('linking', () => {
  function getFs() {
    const fs = new Scope('fs');
    fs.exports = {
      mkdirSync: _filename => true,
      someProperty: { apples: 'oranges' }
    };
    return fs;
  }

  it('should link modules', () => {
    const scope = new Scope();
    expect(() => scope.require('fs')).toThrow();
    scope.link(getFs());
    expect(() => scope.require('fs')).not.toThrow();
  });

  it('should allow access after linking', () => {
    const scope = new Scope();
    scope.link(getFs());
    expect(() => scope.require('fs')).not.toThrow();
    expect(scope.require('fs')).toHaveProperty('someProperty');
  });

  it('should throw on requiring an unloaded module', () => {
    const scope = new Scope();
    expect(() => scope.require('fs')).toThrow();
  });
});

describe('exports', () => {
  it('should add exports', () => {
    const scope = new Scope();
    expect(scope.exports).toEqual({});
    scope.export('apples', 12);
    expect(scope.exports).toHaveProperty('apples');
    expect(scope.exports['apples']).toEqual(12);
  });
});
