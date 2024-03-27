import { isWindow } from '../../utils/detect';

export function hasSystemNotificationsSupport(): boolean {
    return isWindow && Reflect.has(window, 'Notification');
}

export function getPermission(): NotificationPermission | null {
    return hasSystemNotificationsSupport() ? Notification.permission : null;
}
