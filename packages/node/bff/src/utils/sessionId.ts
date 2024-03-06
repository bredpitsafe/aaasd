import { randomUUID } from 'crypto';

import { Opaque } from '../def/types.ts';

export type TSessionId = Opaque<'SessionId', string>;

export function createSessionId(): TSessionId {
    return randomUUID() as TSessionId;
}
