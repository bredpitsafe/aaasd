const { getResult } = require('./commonScript');
const scenarioResultBacktesting = require('./createDataTextShot');

async function sendRequest() {
    const channel = '#qa-herodotus-alerts';
    const file = 'herodotus-robot-tests';

    await getResult('./results/', channel, file, scenarioResultBacktesting);
}

sendRequest();
