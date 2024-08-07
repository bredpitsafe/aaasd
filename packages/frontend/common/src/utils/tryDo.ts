import type { Either } from '../types/Either';
import { left, right } from '../types/Either';

export function tryDo<T>(fn: () => T): Either<T> {
    try {
        return right(fn());
    } catch (err) {
        return left(err as Error);
    }
}

export async function asyncTryDo<T, E extends Error = Error>(
    fn: () => Promise<T>,
): Promise<Either<T, E>> {
    try {
        return [null, await fn()];
    } catch (err) {
        return [err as E, null];
    }
}
