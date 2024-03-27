import { Opaque } from '@backend/utils/src/util-types.ts';
import { randomUUID } from 'crypto';

export type TSessionId = Opaque<'SessionId', string>;

export function createSessionId(): TSessionId {
    return randomUUID() as TSessionId;
}
