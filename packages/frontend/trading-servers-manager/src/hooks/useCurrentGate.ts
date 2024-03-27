import { useModule } from '@frontend/common/src/di/react';
import { ModuleGates } from '@frontend/common/src/modules/gates';
import type { TGate } from '@frontend/common/src/types/domain/gates';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';

import { useRouteParams } from './useRouteParams';

export function useCurrentGate(): TGate | undefined {
    const { getGate$ } = useModule(ModuleGates);
    const params = useRouteParams();

    return useSyncObservable(getGate$(params?.gate));
}
