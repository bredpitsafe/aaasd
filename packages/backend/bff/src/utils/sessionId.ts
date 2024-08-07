import type { Opaque } from '@common/types';
import { randomUUID } from 'crypto';

export type TSessionId = Opaque<'SessionId', string>;

export function createSessionId(): TSessionId {
    return randomUUID() as TSessionId;
}
