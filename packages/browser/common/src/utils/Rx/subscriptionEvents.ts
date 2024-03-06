import { ISO } from '../../types/time';

export enum ESubscriptionEventType {
    Update = 'Update',
    Subscribed = 'Subscribed',
}

export type TSubscriptionEvent<T> =
    | ReturnType<typeof createSubscribedEvent>
    | ReturnType<typeof createUpdateEvent<T>>;

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

export function isSubscriptionEventSubscribed<T extends TSubscriptionEvent<any>>(
    event: T,
): event is Extract<T, { type: ESubscriptionEventType.Subscribed }> {
    return event.type === ESubscriptionEventType.Subscribed;
}

export function isSubscriptionEventUpdate<T extends TSubscriptionEvent<any>>(
    event: T,
): event is Extract<T, { type: ESubscriptionEventType.Update }> {
    return event.type === ESubscriptionEventType.Update;
}
