import { TMessageProps } from '../lib/messages';
import { TNotificationProps } from '../modules/notifications/def';

export abstract class Mistake extends Error {
    toString(): string {
        return this.message;
    }

    toMessage?(): TMessageProps;
    toNotification?(): TNotificationProps;
}
