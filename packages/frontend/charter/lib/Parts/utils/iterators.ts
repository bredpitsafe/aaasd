import { TPart, TPartPoint } from '../def';
import { fromAbsPoint, getPoint } from './point';

type TOptions = {
    min?: number;
    max?: number;
    leftPoint?: boolean;
    rightPoint?: boolean;
};
type TPredicateForEach = (
    point: TPartPoint,
    index: number,
    part: TPart,
    stop: VoidFunction,
) => unknown;

/**
 * @public
 */
export const partForEach = (part: TPart, fn: TPredicateForEach, options?: TOptions) => {
    let stopped = false;
    const stop = () => (stopped = true);

    if (options?.leftPoint && part.absLeftPoint) {
        const point = fromAbsPoint(part, part.absLeftPoint)!;
        fn(point, -Infinity, part, stop);
    }

    const min = options?.min ?? 0;
    const max = options?.max ?? part.size - 1;

    if (!stopped && part.size > 0) {
        for (let i = min; i <= max; i++) {
            if (stopped) return;
            fn(getPoint(part, i)!, i, part, stop);
        }
    }

    if (!stopped && options?.rightPoint && part.absRightPoint) {
        const point = fromAbsPoint(part, part.absRightPoint)!;
        fn(point, Infinity, part, stop);
    }
};

export const partForEachRight = (part: TPart, fn: TPredicateForEach, options?: TOptions) => {
    let stopped = false;
    const stop = () => (stopped = true);

    if (!stopped && options?.rightPoint && part.absRightPoint) {
        const point = fromAbsPoint(part, part.absRightPoint)!;
        fn(point, Infinity, part, stop);
    }

    const min = options?.min ?? 0;
    const max = options?.max ?? part.size - 1;

    if (!stopped && part.size > 0) {
        for (let i = max; i >= min; i--) {
            if (stopped) return;
            fn(getPoint(part, i)!, i, part, stop);
        }
    }

    if (options?.leftPoint && part.absLeftPoint) {
        const point = fromAbsPoint(part, part.absLeftPoint)!;
        fn(point, -Infinity, part, stop);
    }
};
