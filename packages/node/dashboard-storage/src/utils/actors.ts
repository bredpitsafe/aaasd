import { randomUUID } from 'crypto';

import { TActorSocketKey, TActorSubscriptionKey } from '../def/actor.ts';

const DIVIDER = '#';

export function createActorSocketKey(): TActorSocketKey {
    return randomUUID() as TActorSocketKey;
}

export function createActorSubscriptionKey(
    socketKey: TActorSocketKey,
    correlationId: number,
): TActorSubscriptionKey {
    return `${socketKey}${DIVIDER}${correlationId}` as TActorSubscriptionKey;
}
