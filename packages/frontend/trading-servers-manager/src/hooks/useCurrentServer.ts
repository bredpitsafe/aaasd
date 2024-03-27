import { useModule } from '@frontend/common/src/di/react';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { TServer } from '@frontend/common/src/types/domain/servers';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';

import { useRouteParams } from './useRouteParams';

export function useCurrentServer(): TServer | undefined {
    const { getServer$ } = useModule(ModuleServers);
    const params = useRouteParams();

    return useSyncObservable(getServer$(params?.server)) as TServer | undefined;
}
