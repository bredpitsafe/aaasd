import memoize from 'memoizee';

import type { TContextRef } from '../../di';
import { isWindow } from '../../utils/detect';
import type { IModuleNotifications } from './def';

async function getNotifications(ctx: TContextRef): Promise<IModuleNotifications | undefined> {
    return isWindow
        ? import('./module').then(
              ({ ModuleNotifications }) => ModuleNotifications(ctx),
              () => undefined,
          )
        : undefined;
}

export const getNotificationsModule = memoize(getNotifications, { primitive: true, max: 1 });
