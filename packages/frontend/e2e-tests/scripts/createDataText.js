const greenColor = '#008000';
const readColor = '#B22222';
function scenarioResult(data) {
    let text = '_____________________________________________' + '\n';
    let color;
    const testsuite = data.testsuites.testsuite[1];
    text = 'Tests: ' + testsuite['@_tests'] + '\nFailing: ' + testsuite['@_failures'] + '\n' + text;
    text = text + '\n*Suite*: ' + testsuite['@_name'] + '\n';
    for (let i = 0; i < testsuite.testcase.length; i++) {
        let testcase = testsuite.testcase[i];
        if (typeof testcase.failure === 'object')
            text = text + '*Scenario*: ' + testcase['@_name'] + ' (*failed*)\n';
    }

    Number(testsuite['@_failures']) === 0 ? (color = greenColor) : (color = readColor);
    return { text: text, color: color };
}

module.exports = scenarioResult;
