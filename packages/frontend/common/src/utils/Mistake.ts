import type { TMessageProps } from '../lib/messages';
import type { TNotificationProps } from '../modules/notifications/def';

export abstract class Mistake extends Error {
    toString(): string {
        return this.message;
    }

    toMessage?(): TMessageProps;
    toNotification?(): TNotificationProps;
}
