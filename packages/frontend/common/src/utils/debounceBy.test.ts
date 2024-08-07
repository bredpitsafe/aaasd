import { debounceBy } from './debounceBy';
import { macroTasks } from './TasksScheduler/macroTasks';

describe('debounceBy', () => {
    it('debounceBy', (done) => {
        const debounced = debounceBy(
            (delay: number) => {
                const sum = delay + debouncedTime;
                const diff = Date.now() - startTime;
                expect(diff - sum < delay).toBeTruthy();

                if (delay === delays[delays.length - 1]) {
                    done();
                }
            },
            ([delay]) => {
                return { delay: delay, group: delay };
            },
        );

        const delays = [32, 64, 128];
        const callTimes = 4;
        const callDelay = 10;
        const debouncedTime = (callTimes + 1) * callDelay;
        const startTime = Date.now();

        macroTasks.addTask(
            () => {
                for (const delay of delays) {
                    debounced(delay);
                }
            },
            { delay: callDelay, times: callTimes },
        );
    });
});
