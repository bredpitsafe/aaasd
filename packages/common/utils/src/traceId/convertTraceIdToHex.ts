import type { Opaque } from '@common/types';
import Long from '@xtuc/long';

import type { TraceId } from './index.ts';

export type TraceIdHex = Opaque<'TraceIdHex', string>;

export const convertTraceIdToHex = (traceId: TraceId): TraceIdHex => {
    const hexTraceId = Long.fromString(traceId, 10).toString(16);
    return (hexTraceId.length % 2 == 1 ? '0' + hexTraceId : traceId) as TraceIdHex;
};
