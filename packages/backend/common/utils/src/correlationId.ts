import type { Opaque } from '@common/types';

export type TCorrelationId = Opaque<'CorrelationId', number>;

export function generateCorrelationId(): TCorrelationId {
    return Math.floor(Math.random() * 10000000) as TCorrelationId;
}
