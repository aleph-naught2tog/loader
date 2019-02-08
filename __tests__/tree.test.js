const { simpleFauxDependencyTree } = require('./mocks/mock_data');
const { unrollDepthFirst } = require('../src/tree');

describe('unrolling', () => {
  it('should do SOMETHING', () => {
    const result = unrollDepthFirst(simpleFauxDependencyTree);
    expect(result).not.toHaveLength(0);
  });

  it('should depth-first keys', () => {
    const small = {
      apples: {
        pears: 99,
        ducks: 12
      }
    };
    const result = unrollDepthFirst(small);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('ducks');
    expect(result[1]).toBe('pears');
    expect(result[2]).toBe('apples');
  });

  it('should reject nothing if reject keys are not present', () => {
    const small = {
      apples: {
        pears: {},
        oranges: 12,
        ducks: {
          beep: 'bop'
        }
      }
    };
    const result = unrollDepthFirst(small, {
      reject: {
        bananas: true // JUST this gives us everything
      }
    });
    expect(result).toHaveLength(5);
    expect(result[0]).toBe('beep');
    expect(result[1]).toBe('ducks');
    expect(result[2]).toBe('oranges');
    expect(result[3]).toBe('pears');
    expect(result[4]).toBe('apples');
  });

  it('should not drop verything if first subkey is rejected', () => {
    const small = {
      apples: {
        pears: {},
        oranges: 12,
        ducks: {
          beep: 'bop'
        }
      }
    };
    const result = unrollDepthFirst(small, {
      reject: {
        pears: true
      }
    });
    expect(result).toHaveLength(4);
    expect(result).not.toContain('pears');
    expect(result[0]).toBe('beep');
    expect(result[1]).toBe('ducks');
    expect(result[2]).toBe('oranges');
    expect(result[3]).toBe('apples');
  });

  it('should not include children of rejects', () => {
    const small = {
      apples: {
        pears: {},
        oranges: 12,
        ducks: {
          beep: 'bop'
        },
        potatoes: 'wheeeee'
      }
    };
    const result = unrollDepthFirst(small, {
      reject: {
        ducks: true
      }
    });
    expect(result).toHaveLength(4);
    expect(result).not.toContain('ducks');
    expect(result).not.toContain('beep');
    expect(result[0]).toBe('potatoes');
    expect(result[1]).toBe('oranges');
    expect(result[2]).toBe('pears');
    expect(result[3]).toBe('apples');
  });

  it('should descend and not emit the key of entry', () => {
    const small = {
      apples: {
        pears: {},
        ducks: {
          beep: 'bop'
        },
        oranges: 12,
      }
    };
    const result = unrollDepthFirst(small, {
      descendAndSkipKeyEmit: {
        ducks: true
      }
    });
    expect(result).toHaveLength(4);
    expect(result).not.toContain('ducks');
    expect(result).toContain('beep');

    expect(result[0]).toBe('oranges');
    expect(result[1]).toBe('beep');
    expect(result[2]).toBe('pears');
    expect(result[3]).toBe('apples');
  });

  it('should not include any of a tree that starts with a rejected key', () => {
    const small = {
      apples: {
        pears: {},
        ducks: {
          beep: 'bop'
        },
        oranges: 12,
      }
    };
    const result = unrollDepthFirst(small, {
      reject: {
        ducks: true
      }
    });
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('oranges');
    expect(result[1]).toBe('pears');
    expect(result[2]).toBe('apples');
  });

  it('should not include values of things with rejects keys', () => {
    const small = {
      apples: {
        pears: {},
        oranges: 12,
        ducks: {
          beep: 'bop'
        }
      }
    };
    const result = unrollDepthFirst(small, {
      reject: {
        oranges: true
      }
    });
    expect(result).toHaveLength(4);
    expect(result[0]).toBe('beep');
    expect(result[1]).toBe('ducks');
    expect(result[2]).toBe('pears');
    expect(result[3]).toBe('apples');
  });

  it('should associates captures values with their keys', () => {
    const small = {
      apples: {
        pears: {},
        dependencies: {
          flowers: {
            version: 'blue'
          }
        },
        ducks: {
          beep: 'bop'
        }
      }
    };

    const result = unrollDepthFirst(small, {
      reject: {
        oranges: true
      },
      capture: {
        version: true
      },
    });

    expect(result).toHaveLength(7);
    expect(result).toContain('version=blue');
  });

  it('should emit the value up a level to the parent entry key...uh', () => {
    const small = {
      apples: {
        pears: {},
        dependencies: {
          flowers: {
            version: 'blue'
          }
        },
        ducks: {
          beep: 'bop'
        }
      }
    };

    const result = unrollDepthFirst(small, {
      emitUpOneAndSkip: {
        'version': true
      }
    });

    expect(result).toHaveLength(6);
    expect(result).not.toContain('version');
    expect(result[0]).toBe('beep');
    expect(result[1]).toBe('ducks');
    expect(result[3]).toBe('dependencies');
    expect(result[4]).toBe('pears');
    expect(result[5]).toBe('apples');
    expect(result[2]).toBe('flowers=blue');
  });
});
