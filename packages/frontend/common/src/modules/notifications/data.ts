import { notification } from 'antd';
import hash from 'hash-sum';
import { isEmpty, isEqual } from 'lodash-es';

import { CommonErrorView } from '../../components/CommonErrorView';
import { createObservableBox } from '../../utils/rx';
import type { TNotification } from './def';

export const listNotificationsBox = createObservableBox<TNotification[]>([]);

export function addNotificationToList(props: TNotification): void {
    listNotificationsBox.set((prev) => [props].concat(prev));
}

export function clearList(): void {
    listNotificationsBox.set([]);
}

export function deleteFromList(id: string): void {
    listNotificationsBox.set((list) => list.filter((item) => item.id !== id));
}

export function createUINotificationManager(): (props: TNotification) => void {
    const visibleNotifications = new Map<string, Set<TNotification>>();

    return function addNotificationToUI(props: TNotification): void {
        const key = `${props.type ?? 'unknown'}: ${props.message} (${hash(props.popupSettings)})`;

        const notificationSet = visibleNotifications.get(key) ?? new Set();

        if (hasSimilarMessage(props, notificationSet)) {
            props.popupSettings?.onClose?.();
            return;
        }

        notificationSet.add(props);
        visibleNotifications.set(key, notificationSet);

        const alertNotificationProps = toPopupProps(props);

        notification[props.type]({
            ...alertNotificationProps,
            onClose() {
                alertNotificationProps.onClose?.();
                notificationSet.delete(props);
            },
        });
    };
}

function hasSimilarMessage(
    notification: TNotification,
    notificationSet: Set<TNotification>,
): boolean {
    for (const shownNotification of notificationSet.keys()) {
        if (
            (isEmpty(shownNotification.description) && isEmpty(notification.description)) ||
            isEqual(shownNotification.description, notification.description)
        ) {
            return true;
        }
    }

    return false;
}

function toPopupProps(props: TNotification): any {
    return {
        key: props.id,
        message: CommonErrorView(props),
        ...props.popupSettings,
    };
}
