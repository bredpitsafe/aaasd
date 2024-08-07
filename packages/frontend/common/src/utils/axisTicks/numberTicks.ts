// copy from https://github.com/d3/d3-array/blob/main/src/ticks.js

const e10 = Math.sqrt(50);
const e5 = Math.sqrt(10);
const e2 = Math.sqrt(2);

export function numberTicks(start: number, stop: number, count: number): number[] {
    let i = -1;
    let n;
    let ticks;
    let step;

    if (start === stop && count > 0) return [start];

    const reverse = stop < start;

    if (reverse) {
        n = start;
        start = stop;
        stop = n;
    }

    step = tickIncrement(start, stop, count);

    if (step === 0 || !isFinite(step)) {
        return [];
    }

    if (step > 0) {
        let r0 = Math.round(start / step);
        let r1 = Math.round(stop / step);

        if (r0 * step < start) ++r0;
        if (r1 * step > stop) --r1;

        ticks = new Array((n = r1 - r0 + 1));

        while (++i < n) {
            ticks[i] = (r0 + i) * step;
        }
    } else {
        step = -step;
        let r0 = Math.round(start * step);
        let r1 = Math.round(stop * step);

        if (r0 / step < start) ++r0;
        if (r1 / step > stop) --r1;

        ticks = new Array((n = r1 - r0 + 1));

        while (++i < n) {
            ticks[i] = (r0 + i) / step;
        }
    }

    if (reverse) ticks.reverse();

    return ticks;
}

export function tickIncrement(start: number, stop: number, count: number): number {
    const step = (stop - start) / Math.max(0, count);
    const power = Math.floor(Math.log(step) / Math.LN10);
    const error = step / Math.pow(10, power);

    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}
