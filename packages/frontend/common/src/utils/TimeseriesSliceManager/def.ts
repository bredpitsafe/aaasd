import { Milliseconds, TSomeDateType } from '../../types/time';
import { mul } from '../math';
import { getNowMilliseconds } from '../time';
import { TLogger } from '../Tracing';

export const FINITE_PAST = 0 as Milliseconds;
export const FINITE_FUTURE = mul(getNowMilliseconds(), 2);

export type TContext<T> = {
    readonly getId: (item: T) => unknown;
    readonly getTime: (item: T) => TSomeDateType;
    readonly logger?: TLogger;
};
