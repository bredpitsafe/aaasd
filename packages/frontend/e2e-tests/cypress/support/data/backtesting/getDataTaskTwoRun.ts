import { TDataTask } from '../../../lib/interfaces/backtesting/dataTack';

export function getDataTaskTwoRun(): TDataTask {
    return {
        taskId: '22498',
        runIds: ['25199', '25200'],
        totalRuns: '2',
        runStatus: 'Succeed',
        progress: '100.00%',
        runSpeeds: ['1.37', '1.37'],
        startTimes: ['2024-04-11 10:17:23', '2024-04-11 10:18:07'],
        simStartTimes: ['2023-03-28 14:00:00', '2023-02-28 14:00:00'],
        simEndTimes: ['2023-03-28 14:01:00', '2023-02-28 14:01:00'],
        groups: ['first', 'second'],
        instruments: ['adausdt|HuobiSpot', 'ETHBTC|BinanceSpot'],
        endMessage: 'Enabled',
        timeUTCs: ['2023-03-28 14:01:00.000', '2023-02-28 14:01:00.000'],
        level: 'Info',
        nameRobot: 'IndicatorRobot',
        kindRobot: 'test_indicator_robot',
    };
}
