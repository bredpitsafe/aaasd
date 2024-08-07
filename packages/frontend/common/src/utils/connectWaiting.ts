import { macroTasks } from './TasksScheduler/macroTasks';

export async function connectWaiting(el: HTMLElement): Promise<HTMLElement> {
    return new Promise((r) => {
        const clear = macroTasks.addInterval(() => {
            if (el.parentElement) {
                clear();
                r(el.parentElement);
            }
        }, 16);
    });
}
