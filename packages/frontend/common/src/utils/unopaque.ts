import type { Opaque, Unopaque } from '@common/types';

export function unopaque<T extends Opaque<unknown, unknown>>(some: T): Unopaque<T> {
    return some as Unopaque<T>;
}
