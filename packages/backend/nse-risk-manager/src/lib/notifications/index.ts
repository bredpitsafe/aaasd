import { createUINotificationManager } from '@frontend/common/src/modules/notifications/data';
import {
    ENotificationsType,
    TNotification,
    TNotificationProps,
} from '@frontend/common/src/modules/notifications/def';
import { getRandomUint32 } from '@frontend/common/src/utils/random';
import { getNowMilliseconds } from '@frontend/common/src/utils/time';

const add = createUINotificationManager();

export const success = (props: TNotificationProps): void => {
    add(toFullProps(props, ENotificationsType.Success));
};

export const error = (props: TNotificationProps): void => {
    add(toFullProps(props, ENotificationsType.Error));
};

function toFullProps(props: TNotificationProps, type: ENotificationsType): TNotification {
    return {
        ...props,
        id: props.id || String(getRandomUint32()),
        timestamp: props.timestamp || getNowMilliseconds(),
        type,
    };
}
