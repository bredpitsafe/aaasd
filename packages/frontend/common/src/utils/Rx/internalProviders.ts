import { animationFrameProvider } from 'rxjs/internal/scheduler/animationFrameProvider';
import { intervalProvider } from 'rxjs/internal/scheduler/intervalProvider';
import { timeoutProvider } from 'rxjs/internal/scheduler/timeoutProvider';

import { macroTasks } from '../TasksScheduler/macroTasks';

type THandler = (...args: any[]) => any;
type TimerHandle = number | ReturnType<typeof setTimeout>;

intervalProvider.delegate = {
    setInterval(handler: THandler, timeout?: number, ...args: unknown[]): number {
        const id = macroTasks.createId();

        macroTasks.addTask(handler, {
            id,
            args,
            delay: timeout ?? 1,
            times: Infinity,
        });

        return id;
    },
    clearInterval(handle: TimerHandle) {
        macroTasks.deleteTask(handle as number);
    },
};

timeoutProvider.delegate = {
    setTimeout(handler: THandler, timeout?: number, ...args: unknown[]): number {
        const id = macroTasks.createId();

        macroTasks.addTask(handler, {
            id,
            args,
            delay: timeout ?? 1,
            times: 1,
        });

        return id;
    },
    clearTimeout(handle: TimerHandle) {
        macroTasks.deleteTask(handle as number);
    },
};

if (typeof globalThis.requestAnimationFrame === 'function') {
    const { frameTasks } = require('../TasksScheduler/frameTasks');

    animationFrameProvider.delegate = {
        requestAnimationFrame(handler: THandler, ...args: unknown[]): number {
            const id = frameTasks.createId();

            frameTasks.addTask(handler, {
                id,
                args,
                delay: 1,
                times: 1,
            });

            return id;
        },
        cancelAnimationFrame(handle: number) {
            frameTasks.deleteTask(handle);
        },
    };
}
