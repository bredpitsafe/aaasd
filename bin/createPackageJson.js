const { createProjectGraphAsync, detectPackageManager } = require('@nx/devkit');
const { createLockFile, createPackageJson, getLockFileName } = require('@nx/js');
const { writeFileSync, mkdirSync } = require('fs');
const path = require('node:path');

// Get NX project name to build package.json from args
// e.g. `node ./path/to/createPackageJson.js *@frontend/package*`
const projectName = process.argv[2];
console.log('script args: ', process.argv);
console.log('projectName: ', projectName);
if (projectName === undefined) {
    throw new Error('Please provide a valid project name');
}

// Acquire NX project graph to get dependencies from
console.log('Creating async project graph');
createProjectGraphAsync().then((projectGraph) => {
    if (!projectGraph) {
        throw new Error('Cannot acquire NX project graph');
    }
    console.log('Async project graph acquired');
    // Result will be saved to `REPO_ROOT/dist/@scope/package-name`
    const repoRoot = path.resolve(__dirname, '..');
    const packageRoot = path.resolve(repoRoot, projectGraph.nodes[projectName].data.root);
    const outputDir = path.resolve(repoRoot, 'dist', projectName);

    console.log('Repo root: ', repoRoot);
    console.log('Package root: ', packageRoot);
    console.log('Output dir: ', outputDir);

    // Change current working directory to be project root.
    // Otherwise, NX internals will fail when trying to read package-lock.json
    process.chdir(repoRoot);

    // Generate package.json
    const packageJson = createPackageJson(projectName, projectGraph, {
        isProduction: true, // Used to strip any non-prod dependencies
        root: packageRoot,
    });

    console.log('package.json generated');

    // Generate package-lock.json
    const pm = detectPackageManager();
    console.log('Package manager detected: ', pm);

    const lockFile = createLockFile(packageJson, projectGraph, pm);
    const lockFileName = getLockFileName(pm);

    console.log('Lock file generated:', lockFileName);

    // Write output to `outputDir`, create directories if necessary
    mkdirSync(outputDir, { recursive: true });
    console.log('Output directory created', outputDir);

    // Somehow `packageJson` is an object, but `lockFile` is a string, WTF NX?!
    writeFileSync(path.resolve(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    writeFileSync(path.resolve(outputDir, lockFileName), lockFile, {
        encoding: 'utf8',
    });

    console.log('Files written to output directory, script success');
    process.exit(0);
});
