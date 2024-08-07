import { interval } from '../interval';
import { TasksManager } from './TasksManager';

class MacroTasks extends TasksManager {
    constructor(delay = 8) {
        super((fn) => {
            interval.set(fn, delay);
            return () => interval.clear(fn);
        });
    }
}

export const macroTasks = new MacroTasks();
