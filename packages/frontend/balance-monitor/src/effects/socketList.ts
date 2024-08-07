import { ModuleSocketList } from '@frontend/common/src//modules/socketList';
import type { TContextRef } from '@frontend/common/src/di';
import { loadConfig } from '@frontend/common/src/effects/socketList';
import { ModuleApplicationName } from '@frontend/common/src/modules/applicationName';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { EBalanceMonitorSettings } from '../components/Settings/def';
import { SHOW_LOCALHOST_SOCKET_DEFAULT_VALUE } from '../components/Settings/hooks/useShowLocalhostSocket';

export function initSocketListEffects(ctx: TContextRef) {
    const { setSockets } = ModuleSocketList(ctx);
    const { getAppSettings$ } = ModuleSettings(ctx);
    const { appName } = ModuleApplicationName(ctx);
    const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);

    const sockets$ = loadConfig('atf.urls.json');
    const settings$ = getAppSettings$(appName, EBalanceMonitorSettings.ShowLocalhostSocket).pipe(
        notifyErrorAndFail(),
        extractSyncedValueFromValueDescriptor(),
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
