import { EnvelopeDispatchTarget } from 'webactor';

import { collectAppTimeToFrameEnvBox } from '../../actors/Metrics/actions';
import { EApplicationName } from '../../types/app';
import { Milliseconds } from '../../types/time';
import { frameTasks } from '../../utils/TasksScheduler/frameTasks';
import { macroTasks } from '../../utils/TasksScheduler/macroTasks';
import { getNowMilliseconds } from '../../utils/time';

export function setupCollectingTimeToFrame(
    name: EApplicationName,
    root: EnvelopeDispatchTarget,
): void {
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
        collectAppTimeToFrameEnvBox.send(root, {
            labels: [name],
            observe: average,
        });
        sum = <Milliseconds>0;
        count = <Milliseconds>0;
    }, 30_000);
}
