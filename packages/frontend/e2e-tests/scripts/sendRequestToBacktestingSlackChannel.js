const { getResult } = require('./commonScript');
const scenarioResultBacktesting = require('./createDataTextShot');

async function sendRequest() {
    const channel = '#qa-backtest-alerts';
    const file = 'backtesting-tests';

    await getResult('./cypress/results/', channel, file, scenarioResultBacktesting);
}

sendRequest();
