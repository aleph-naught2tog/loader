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

const x = {
  beige: { // no -- 'apples' comes after
    random: { // yes -- only
      pale: 'moon', // no -- 'adjective' comes after
      adjective: 'out of ideas', // yes -- last key
    }
  },
  apples: { // yes -- last key
    pears: {}, // no -- 'sweet', 'ducks' come after
    sweet: { // no -- 'ducks' comes after
      otherKey: 99, // no -- 'flowers' comes after
      flowers: { // yes -- last key
        smoky: 'blue' // yes -- only key
      }
    },
    ducks: { // yes -- last key
      beep: 'bop', // no -- 'bing', 'pop' come after
      bing: 'zip', // no -- 'bing' comes after
      pop: 'whee' // yes -- 'pop'
    }
  }
};
