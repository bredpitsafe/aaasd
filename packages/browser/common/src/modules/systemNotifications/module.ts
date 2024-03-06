import { isNil } from 'lodash-es';
import { interval, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';

import { ModuleFactory } from '../../di';
import { getPermission, hasSystemNotificationsSupport } from './utils';

function createModule() {
    return {
        getPermission,
        permission$: hasSystemNotificationsSupport()
            ? interval(500).pipe(
                  startWith(getPermission()),
                  map(getPermission),
                  distinctUntilChanged(),
                  shareReplay(1),
              )
            : of(null),
        async requestPermission(): Promise<NotificationPermission> {
            const permission = getPermission();

            if (isNil(permission)) {
                throw new Error(`NotificationAPI is not supported`);
            }

            if (permission !== 'default') {
                return permission;
            }

            return await Notification.requestPermission();
        },
        createNotification(title: string, options?: NotificationOptions): Notification | null {
            if (getPermission() !== 'granted') {
                return null;
            }

            return new Notification(title, options);
        },
    };
}

export const ModuleSystemNotifications = ModuleFactory(createModule);
