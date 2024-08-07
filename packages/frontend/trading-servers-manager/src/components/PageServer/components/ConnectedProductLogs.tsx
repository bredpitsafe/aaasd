import { ConnectedCommonProductLogs } from '@frontend/common/src/components/Pages/ConnectedCommonProductLogs';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { useRouteParams } from '../../../hooks/useRouteParams';

enum ESeedLocalStorageKey {
    Hook = 'SERVER_PRODUCT_LOGS_HOOK_STATE',
    View = 'SERVER_PRODUCT_LOGS_VIEW_STATE',
}

function getLocalStorageKeys(id: string): { hook: string; view: string } {
    return {
        hook: `${ESeedLocalStorageKey.Hook}_${id}`,
        view: `${ESeedLocalStorageKey.View}_${id}`,
    };
}

export function ConnectedProductLogs(): null | ReactElement {
    const routeParams = useRouteParams();
    const { currentSocketUrl$ } = useModule(ModuleCommunication);

    const socketUrl = useSyncObservable(currentSocketUrl$);

    const storageKeys = useMemo(() => {
        return routeParams === undefined
            ? undefined
            : getLocalStorageKeys(
                  `server:[${routeParams.server}],component:[${
                      routeParams.gate ?? routeParams.robot
                  }]`,
              );
    }, [routeParams]);

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return socketUrl === undefined || storageKeys === undefined ? null : (
        <ConnectedCommonProductLogs
            socketUrl={socketUrl}
            storageKeys={storageKeys}
            timeZone={timeZone}
        />
    );
}
