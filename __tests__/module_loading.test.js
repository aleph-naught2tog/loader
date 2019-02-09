const tree = require('../src/tree');
const { fakeProject } = require('./mocks/sample_lock');

const parseopts = {
  emitUpOneAndSkip: {
    version: true
  },
  reject: {
    integrity: true,
    resolved: true,
    bundled: true,
  },
  descendAndSkipKeyEmit: {
    dependencies: true,
    requires: true
  },
  fail: [item => item.dev]
};

describe('parsing deps', () => {
  it('hould parse lockfile', () => {
    const result = tree.unrollDepthFirst(fakeProject, parseopts);
    console.log(result)
  });
});
