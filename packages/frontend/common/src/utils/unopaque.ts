import { Opaque, Unopaque } from '../types';

export function unopaque<T extends Opaque<unknown, unknown>>(some: T): Unopaque<T> {
    return some as Unopaque<T>;
}
