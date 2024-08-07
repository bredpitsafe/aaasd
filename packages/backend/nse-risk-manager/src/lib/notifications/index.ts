import { getNowMilliseconds } from '@common/utils';
import { createUINotificationManager } from '@frontend/common/src/modules/notifications/data';
import type {
    TNotification,
    TNotificationProps,
} from '@frontend/common/src/modules/notifications/def';
import { ENotificationsType } from '@frontend/common/src/modules/notifications/def';
import { getRandomUint32 } from '@frontend/common/src/utils/random';

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
