const tree = require('./tree');
const fs = require('fs');

exports.processPackageLock = processPackageLock;
function processPackageLock() {
  const packageLockData = fs.readFileSync('package-lock.json');
  const lockJson = JSON.parse(packageLockData);
  const result = tree.unrollDepthFirst(lockJson, {
    reject: {
      // the "true" here is just a placeholder; what we really want are the keys
      // anyways
      integrity: true,
      resolved: true,
      bundled: true
    },
    fail: [item => item.dev || item.optional]
  });

  return result;
}
