import { writeFile } from 'fs/promises';
import { compileFromFile } from 'json-schema-to-typescript';
import { resolve } from 'path';

const importDir = resolve('./src/schemas');
const exportDir = resolve('./src/def');

const files = ['request', 'response'];

for (const file of files) {
    const importPath = resolve(importDir, `${file}.json`);
    const res = await compileFromFile(importPath, { cwd: importDir });

    const exportPath = resolve(exportDir, `${file}.ts`);
    await writeFile(exportPath, res);
}
