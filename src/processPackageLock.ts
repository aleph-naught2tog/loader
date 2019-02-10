import * as tree from './tree';
import fs from 'fs';

export function processPackageLock(traversalOptions: tree.optionType) {
  const packageLockData = fs.readFileSync('package-lock.json', {
    encoding: 'utf8'
  });
  const lockJson = JSON.parse(packageLockData);
  const result = tree.unrollDepthFirst(lockJson, traversalOptions);

  return result;
}
