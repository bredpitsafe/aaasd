import { macroTasks } from './TasksScheduler/macroTasks';

export function delay(ms: number): Promise<number> {
    return new Promise((r) => macroTasks.addTimeout(() => r(ms), ms));
}
