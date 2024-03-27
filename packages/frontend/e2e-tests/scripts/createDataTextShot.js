const greenColor = '#008000';
const readColor = '#B22222';
function scenarioResultShot(data) {
    let text = '_____________________________________________' + '\n';
    let color;
    let testsCount = 0;
    let testsFailuresCount = 0;
    for (let i = 0; i < data.length; i++) {
        const testsuite = data[i].testsuites;
        testsCount = testsCount + Number(testsuite['@_tests']);
        testsFailuresCount = testsFailuresCount + Number(testsuite['@_failures']);
    }
    text = 'Tests: ' + testsCount + '\nFailing: ' + testsFailuresCount + '\n' + text;
    Number(testsFailuresCount) === 0 ? (color = greenColor) : (color = readColor);
    return { text: text, color: color };
}

module.exports = scenarioResultShot;
