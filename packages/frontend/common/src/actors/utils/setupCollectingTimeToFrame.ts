import type { EApplicationName, Milliseconds } from '@common/types';
import { getNowMilliseconds } from '@common/utils';

import { frameTasks } from '../../utils/TasksScheduler/frameTasks.ts';
import { macroTasks } from '../../utils/TasksScheduler/macroTasks.ts';
import { collectAppTimeToFrameEnvBox } from '../Metrics/actions.ts';

export function setupCollectingTimeToFrame(name: EApplicationName): void {
    let sum = <Milliseconds>0;
    let count = <Milliseconds>0;
    let average = <Milliseconds>16.6; // 60fps by default

    let prevTime = getNowMilliseconds();
    let currentTime = prevTime;

    frameTasks.addInterval(() => {
        currentTime = getNowMilliseconds();

        // surge after change active tab(stop/start rAF)
        if (currentTime - prevTime < average * 50) {
            count++;
            sum = <Milliseconds>(sum + currentTime - prevTime);
            average = <Milliseconds>(sum / count);
        }

        prevTime = currentTime;
    }, 1);

    macroTasks.addInterval(() => {
        collectAppTimeToFrameEnvBox.send(null, {
            labels: [name],
            observe: average,
        });
        sum = <Milliseconds>0;
        count = <Milliseconds>0;
    }, 30_000);
}
