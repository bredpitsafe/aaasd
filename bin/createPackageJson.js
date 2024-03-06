const {
    createProjectGraphAsync,
    readCachedProjectGraph,
    detectPackageManager,
} = require('@nx/devkit');
const { createLockFile, createPackageJson, getLockFileName } = require('@nx/js');
const { writeFileSync, mkdirSync } = require('fs');
const path = require('node:path');

(async function main() {
    // Get NX project name to build package.json from args
    // e.g. `node ./path/to/createPackageJson.js *@frontend/package*`
    const projectName = process.argv[2];
    if (projectName === undefined) {
        throw new Error('Please provide a valid project name');
    }
    // Acquire NX project graph to get dependencies from
    let projectGraph;
    try {
        projectGraph = readCachedProjectGraph();
    } catch (e) {
        projectGraph = await createProjectGraphAsync();
    }
    if (!projectGraph) {
        throw new Error('Cannot acquire NX project graph');
    }

    // Result will be saved to `REPO_ROOT/dist/@scope/package-name`
    const repoRoot = path.resolve(__dirname, '..');
    const packageRoot = path.resolve(repoRoot, projectGraph.nodes[projectName].data.root);
    const outputDir = path.resolve(repoRoot, 'dist', projectName);

    // Change current working directory to be project root.
    // Otherwise, NX internals will fail when trying to read package-lock.json
    process.chdir(repoRoot);

    // Generate package.json
    const packageJson = createPackageJson(projectName, projectGraph, {
        isProduction: true, // Used to strip any non-prod dependencies
        root: packageRoot,
    });

    // Generate package-lock.json
    const pm = detectPackageManager();
    const lockFile = createLockFile(packageJson, projectGraph, pm);
    const lockFileName = getLockFileName(pm);

    // Write output to `outputDir`, create directories if necessary
    mkdirSync(outputDir, { recursive: true });
    // Somehow `packageJson` is an object, but `lockFile` is a string, WTF NX?!
    writeFileSync(path.resolve(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    writeFileSync(path.resolve(outputDir, lockFileName), lockFile, {
        encoding: 'utf8',
    });
})();
