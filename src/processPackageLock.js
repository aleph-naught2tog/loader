const tree = require('./tree');
const fs = require('fs');

const DEFAULT_TRAVERSAL_OPTIONS = {
  reject: {
    // the "true" here is just a placeholder; what we really want are the keys
    integrity: true,
    resolved: true,
    bundled: true
  },
  fail: [item => item.dev]
};

exports.processPackageLock = processPackageLock;
function processPackageLock(traversalOptions = DEFAULT_TRAVERSAL_OPTIONS) {
  const packageLockData = fs.readFileSync('package-lock.json');
  const lockJson = JSON.parse(packageLockData);
  const result = tree.unrollDepthFirst(lockJson, traversalOptions);

  return result;
}
