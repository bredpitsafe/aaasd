const {
    readFile: absolutePathReadFile,
    writeFile: absolutePathWriteFile,
    createScriptSection,
    createRuleSection,
    createHeaderSection,
} = require('../../../../build-pegjs');

const readFile = absolutePathReadFile.bind(global, __dirname);
const writeFile = absolutePathWriteFile.bind(global, __dirname);

(async () => {
    const globalScript = await readFile('custom-view.script.js');
    const startRule = await readFile('custom-view.root.pegjs');
    const rules = await Promise.all(
        [
            'custom-view.table.pegjs',
            'custom-view.grid.pegjs',
            'custom-view.common.pegjs',
            'custom-view.base.pegjs',
        ].map((fileName) => readFile(fileName)),
    );

    const sections = [
        createHeaderSection(),
        createScriptSection(globalScript),
        createRuleSection(startRule, '(Contains start rule section)'),
        ...rules.map((rule) => createRuleSection(rule)),
    ];

    await writeFile('custom-view.generated.pegjs', sections.join(''));

    console.log('* Successfully generated PegJS');
})();
