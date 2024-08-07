import type { Opaque } from '@common/types';
import Long from '@xtuc/long';

import { getRandomIntInclusive } from '../random.ts';

export type TraceId = Opaque<'TraceId', string>;

const TIMESTAMP_MASK = Long.fromNumber(0x1ffffff, true);
const NODE_NO_PART = Long.fromNumber(65535, true).shiftLeft(22);
const MAX_RANDOM = 2 ** 22 - 1;

/// Generates a new trace id according to the next layout:
/// * 1  bit  0 (zero)
/// * 25 bits timestamp in secs
/// * 16 bits node_no = 65535 (frontend)
/// * 22 bits random
export function generateTraceId(): TraceId {
    const ts = Math.floor(Date.now() / 1000);
    const tsPart = Long.fromNumber(ts, true).and(TIMESTAMP_MASK).shiftLeft(38);

    const random = getRandomIntInclusive(0, MAX_RANDOM);
    const randomPart = Long.fromNumber(random, true);

    return tsPart.or(NODE_NO_PART).or(randomPart).toString() as TraceId;
}
