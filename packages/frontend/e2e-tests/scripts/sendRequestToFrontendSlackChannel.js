const fs = require('fs');
const sendRequest = require('./sendRequest');
const header = require('./createHeaderText');
const scenarioResult = require('./createDataText');
const { XMLParser } = require('fast-xml-parser');
const options = {
    ignoreAttributes: false,
};
const parser = new XMLParser(options);
const channel = '#frontend-tests-reports';

getResult('./cypress/results/');

async function getResult(source) {
    const fileList = await fs.promises.readdir(source);

    const result = await Promise.all(
        fileList.map(async (file) => {
            const xml = await fs.promises.readFile(source + file);
            return parser.parse(xml.toString());
        }),
    );

    for (let i = 0; i < result.length; i++) {
        let data = scenarioResult(result[i]);
        data.header = header;
        sendRequest(data, channel);
    }
}
