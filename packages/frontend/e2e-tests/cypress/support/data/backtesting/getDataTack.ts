import { TDataTask } from '../../../lib/interfaces/backtesting/dataTack';

export function getDataTask(): TDataTask {
    return {
        taskId: '28614',
        runIds: ['32112'],
        totalRuns: '1',
        runStatus: 'Succeed',
        runSpeeds: ['3.90'],
        progress: '100.00%',
        startTimes: ['2024-07-29 14:24:45'],
        simStartTimes: ['2023-02-28 14:00:00'],
        simEndTimes: ['2023-02-28 14:01:00'],
        component: 'test_indicator_robot.IndicatorRobot',
        startMessage: 'changed status: Enabled→Disabled, details: ',
        endMessage: 'Enabled',
        timeUTCs: ['2023-02-28 14:00:01.000'],
        level: 'Info',
        nameRobot: 'IndicatorRobot',
        kindRobot: 'test_indicator_robot',
    };
}
