import type { ISO } from '@common/types';

export enum ESubscriptionEventType {
    Subscribed = 'Subscribed',
    Update = 'Update',
    Remove = 'Remove',
}

export type TSubscriptionEventUpdate<T> = ReturnType<typeof createUpdateEvent<T>>;
export type TSubscriptionEventRemove<T> = ReturnType<typeof createRemoveEvent<T>>;
export type TSubscriptionEventSubscribed = ReturnType<typeof createSubscribedEvent>;

export type TSubscriptionEvent<T, R = T> =
    | TSubscriptionEventSubscribed
    | TSubscriptionEventUpdate<T>
    | TSubscriptionEventRemove<R>;

export function createSubscribedEvent(payload: { platformTime: ISO | null; index: number }): {
    type: ESubscriptionEventType.Subscribed;
    payload: { platformTime: ISO | null; index: number };
} {
    return { type: ESubscriptionEventType.Subscribed, payload };
}

export function createUpdateEvent<T>(payload: T): {
    type: ESubscriptionEventType.Update;
    payload: T;
} {
    return { type: ESubscriptionEventType.Update, payload };
}

export function createRemoveEvent<T>(payload: T): {
    type: ESubscriptionEventType.Remove;
    payload: T;
} {
    return { type: ESubscriptionEventType.Remove, payload };
}

export function isSubscriptionEventSubscribed<T extends TSubscriptionEvent<any, any>>(
    event: T,
): event is Extract<T, { type: ESubscriptionEventType.Subscribed }> {
    return event.type === ESubscriptionEventType.Subscribed;
}

export function isSubscriptionEventUpdate<T extends TSubscriptionEvent<any, any>>(
    event: T,
): event is Extract<T, { type: ESubscriptionEventType.Update }> {
    return event.type === ESubscriptionEventType.Update;
}

export function isSubscriptionEventRemove<T extends TSubscriptionEvent<any, any>>(
    event: T,
): event is Extract<T, { type: ESubscriptionEventType.Remove }> {
    return event.type === ESubscriptionEventType.Remove;
}
