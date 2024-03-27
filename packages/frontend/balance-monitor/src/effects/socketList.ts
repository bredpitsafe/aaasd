import { ModuleSocketList } from '@frontend/common/src//modules/socketList';
import type { TContextRef } from '@frontend/common/src/di';
import { loadConfig } from '@frontend/common/src/effects/socketList';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { EBalanceMonitorSettings } from '../components/Settings/def';
import { SHOW_LOCALHOST_SOCKET_DEFAULT_VALUE } from '../components/Settings/hooks/useShowLocalhostSocket';

export function initSocketListEffects(ctx: TContextRef) {
    const { setSockets } = ModuleSocketList(ctx);
    const { getAppSettings$ } = ModuleSettings(ctx);

    const sockets$ = loadConfig('atf.urls.json');
    const settings$ = getAppSettings$<boolean>(
        EApplicationName.BalanceMonitor,
        EBalanceMonitorSettings.ShowLocalhostSocket,
    );

    combineLatest([sockets$, settings$])
        .pipe(
            map(([sockets, value]) => {
                // If corresponding setting is disabled, exclude localhost from available sockets map.
                const enableLocalhost = value ?? SHOW_LOCALHOST_SOCKET_DEFAULT_VALUE;
                if (!enableLocalhost && 'localhost' in sockets) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { localhost, ...restSockets } = sockets;
                    return restSockets;
                }
                return sockets;
            }),
        )
        .subscribe(setSockets);
}
