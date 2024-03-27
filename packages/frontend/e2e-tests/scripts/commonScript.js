const fs = require('fs');
const sendRequest = require('./sendRequest');
const header = require('./createHeaderTextShot');
const { XMLParser } = require('fast-xml-parser');
const scenarioResult = require('./createDataTextShot');
const options = {
    ignoreAttributes: false,
};
const parser = new XMLParser(options);

async function getResult(source, channel, file) {
    const fileList = await fs.promises.readdir(source);

    const herodotusFiles = fileList.filter((file) => file.startsWith(file));

    const result = await Promise.all(
        herodotusFiles.map((file) => {
            return fs.promises.readFile(source + file).then((result) => parser.parse(result));
        }),
    );

    let data = scenarioResult(result);
    data.header = header;
    sendRequest(data, channel, file);
}

module.exports = {
    getResult,
};
