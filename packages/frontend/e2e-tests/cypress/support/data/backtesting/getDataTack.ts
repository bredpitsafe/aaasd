import { TDataTask } from '../../../lib/interfaces/backtesting/dataTack';

export function getDataTask(): TDataTask {
    return {
        taskId: '19159',
        runIds: ['21443'],
        totalRuns: '1',
        runStatus: 'Succeed',
        runSpeeds: ['1.93'],
        progress: '100.00%',
        startTimes: ['2024-03-07 06:30:16'],
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
