const {
  getImportData,
  requireVersionOfImport
} = require('../src/getAllDependencyData');

const importStruct = (name, path) => ({
  packageName: name,
  path: path
});

describe('map to requires', () => {
  it('also fine?', () => {
    const other = requireVersionOfImport(
      importStruct('{ export1 , export2 as alias2 }', 'module-name')
    );

    expect(other).toBe(
      `const { export1 , export2: alias2 } = require('module-name');`
    );

    const result = requireVersionOfImport(
      importStruct('{ exportName as alias }', 'module-name')
    );

    expect(result).toBe(
      `const { exportName: alias } = require('module-name');`
    );
  });

  it('should probably be fine here', () => {
    const other = requireVersionOfImport(
      importStruct('defaultExport, { exportName }', 'module-name')
    );

    expect(other).toBe(
      `const defaultExport, { exportName } = require('module-name');`
    );

    const result = requireVersionOfImport(
      importStruct('defaultExport, * as name', 'module-name')
    );

    // const first, second = require('fs'); // ugh, valid, fine.
    expect(result).toBe("const defaultExport, name = require('module-name');");
  });

  it('should work on boring default export', () => {
    const result = requireVersionOfImport(
      importStruct('defaultExport', 'module-name')
    );

    expect(result).toEqual(`const defaultExport = require('module-name');`);
  });

  it('should work on multiple basic destructured imports', () => {
    const result = requireVersionOfImport(
      importStruct('{ export1 , export2 }', 'module-name')
    );

    expect(result).toBe(
      `const { export1 , export2 } = require('module-name');`
    );
  });

  it('should work on a signle destructured import', () => {
    const result = requireVersionOfImport(
      importStruct('{ exportName }', 'module-name')
    );

    expect(result).toBe(`const { exportName } = require('module-name');`);
  });

  it('should do fine with slashy paths', () => {
    const packageName = '{ foo , bar }';
    const path = 'module-name/un-exported/file';
    const result = requireVersionOfImport(importStruct(packageName, path));

    expect(result).toBe(`const ${packageName} = require('${path}');`);
  });

  it('should extract package names with aliases whole', () => {
    const result = requireVersionOfImport(
      importStruct('* as name', 'module-name')
    );

    expect(result).toBe("const name = require('module-name');");
  });
});

describe('getImportData', () => {
  it('should be fine?', () => {
    expect(
      getImportData(
        'import { export1 , export2 as alias2 } from "module-name";'
      )
    ).toEqual(importStruct('{ export1 , export2 as alias2 }', 'module-name'));

    expect(
      getImportData('import defaultExport, { exportName } from "module-name";')
    ).toEqual(importStruct('defaultExport, { exportName }', 'module-name'));

    expect(
      getImportData('import { exportName as alias } from "module-name";')
    ).toEqual(importStruct('{ exportName as alias }', 'module-name'));

    expect(
      getImportData('import defaultExport, * as name from "module-name";')
    ).toEqual(importStruct('defaultExport, * as name', 'module-name'));
  });

  it('should work on boring default export', () => {
    expect(getImportData('import defaultExport from "module-name";')).toEqual(
      importStruct('defaultExport', 'module-name')
    );
  });

  it('should work on multiple basic destructured imports', () => {
    expect(
      getImportData('import { export1 , export2 } from "module-name";')
    ).toEqual(importStruct('{ export1 , export2 }', 'module-name'));
  });

  it('should work on a signle destructured import', () => {
    expect(getImportData('import { exportName } from "module-name";')).toEqual(
      importStruct('{ exportName }', 'module-name')
    );
  });

  it('should do fine with slashy paths', () => {
    expect(
      getImportData(
        'import { foo , bar } from "module-name/un-exported/file";'
      )
    ).toEqual(importStruct('{ foo , bar }', 'module-name/un-exported/file'));
  });

  it('should extract package names with aliases whole', () => {
    expect(getImportData('import * as name from "module-name";')).toEqual(
      importStruct('* as name', 'module-name')
    );
  });

  it('should return null for not import statements', () => {
    expect(
      getImportData(
        'impeach * as asshole_pres from "this-goddamn-government";'
      )
    ).toBeNull();
    expect(getImportData('impooch "not-a-module";')).toBeNull();
    expect(getImportData('important * as "fancy-what";')).toBeNull();
    expect(getImportData('important "message";')).toBeNull();
  });
});
