describe('makeFileIfNotExists should be idempotentish', () => {
  const { makeFolderIfNotExists } = require('../lib/file_utils');
  const fakeDirectory = {};
  const fakeFs = {
    mkdirSync: filename => {
      if (filename in fakeDirectory) {
        throw {
          code: 'EEXIST'
        };
      } else {
        fakeDirectory[filename] = filename;
      }
    }
  };

  it('should cause a file to be "made" if file isnt there', () => {
    const filename = 'boop';
    expect(filename in fakeDirectory).toBeFalsy();
    makeFolderIfNotExists(filename, fakeFs);
    expect(filename in fakeDirectory).toBeTruthy();
  });

  it('should change nothing if the file is there', () => {
    const filename = 'dsadsada';
    fakeDirectory[filename] = filename;
    expect(filename in fakeDirectory).toBeTruthy();
    makeFolderIfNotExists(filename, fakeFs);
    expect(filename in fakeDirectory).toBeTruthy();
  });
});

describe('makeFileIfNotExists should only fail for unknowns', () => {
  const { makeFolderIfNotExists } = require('../lib/file_utils');
  const passFn = {
    mkdirSync: _filename => {
      return true;
    }
  };

  const throwEEXISTFn = {
    mkdirSync: _filename => {
      throw {
        code: 'EEXIST'
      };
    }
  };

  it('should not throw if nothing is thrown', () => {
    expect(() => makeFolderIfNotExists('beep', passFn)).not.toThrow();
  });

  it('should throw if no error code when thrown', () => {
    expect(() =>
      makeFolderIfNotExists('something', {
        mkdirSync: _ => {
          throw 'tomatoes';
        }
      })
    ).toThrow();
  });

  it('should throw if error code is not EEXIST', () => {
    expect(() =>
      makeFolderIfNotExists('blrop', {
        mkdirSync: _ => {
          throw {
            code: 'ENOENT'
          };
        }
      })
    ).toThrow();
  });

  it('should not throw if EEXIST caught', () => {
    expect(() =>
      makeFolderIfNotExists('something', throwEEXISTFn)
    ).not.toThrow();
  });
});
