type TCallback = (...args: unknown[]) => unknown;

class Interval {
    private mapCbToIntervalId = new Map<TCallback, unknown>();

    set(cb: TCallback, ms: number, ...args: unknown[]): VoidFunction {
        const id = setInterval(cb, ms, ...args);
        this.mapCbToIntervalId.set(cb, id);

        return () => {
            clearInterval(id);
            this.mapCbToIntervalId.delete(cb);
        };
    }

    clear(cb: TCallback): void {
        const id = this.mapCbToIntervalId.get(cb);

        if (id) {
            clearInterval(id as number);
            this.mapCbToIntervalId.delete(cb);
        }
    }
}

export const interval = new Interval();
