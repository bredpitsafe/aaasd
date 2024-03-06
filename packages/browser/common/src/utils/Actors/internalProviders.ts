import { intervalProvider, timeoutProvider } from 'webactor';

import { macroTasks } from '../TasksScheduler/macroTasks';

type THandler = (...args: any[]) => any;

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
    clearInterval(handle: number) {
        macroTasks.deleteTask(handle);
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
    clearTimeout(handle: number) {
        macroTasks.deleteTask(handle);
    },
};
