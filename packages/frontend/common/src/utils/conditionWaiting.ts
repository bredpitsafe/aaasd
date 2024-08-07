import { macroTasks } from './TasksScheduler/macroTasks';

export async function conditionWaiting<V>(
    cond: () => V | null | undefined | void,
    delay = 16,
): Promise<V> {
    return new Promise((r) => {
        const clear = macroTasks.addInterval(() => {
            const v = cond();

            if (!!v) {
                clear();
                r(v);
            }
        }, delay);
    });
}
