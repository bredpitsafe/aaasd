import { TDataTask } from '../../../lib/interfaces/backtesting/dataTack';

export function getDataTaskTwoRun(): TDataTask {
    return {
        taskId: '19270',
        runIds: ['21563', '21564'],
        totalRuns: '2',
        runStatus: 'Succeed',
        progress: '100.00%',
        runSpeeds: ['1.29', '1.30'],
        startTimes: ['2024-03-07 14:19:52', '2024-03-07 14:20:39'],
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
