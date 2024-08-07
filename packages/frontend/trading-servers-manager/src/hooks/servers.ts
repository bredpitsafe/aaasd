import { useModule } from '@frontend/common/src/di/react.tsx';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId.ts';
import { ModuleSubscribeToCurrentComponentsSnapshot } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToCurrentComponentsSnapshot.ts';
import type { TServerId } from '@frontend/common/src/types/domain/servers.ts';
import { useValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    distinctValueDescriptorUntilChanged,
    mapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import { of } from 'rxjs';

import { ModuleSubscribeCurrentServer } from '../modules/actions/ModuleSubscribeCurrentServer.ts';
import { useRouteParams } from './useRouteParams.ts';

export function useCurrentServerId(): TServerId | undefined {
    const params = useRouteParams();
    return params?.server;
}

export function useCurrentServer() {
    const traceId = useTraceId();
    const subscribe = useModule(ModuleSubscribeCurrentServer);

    return useValueDescriptorObservable(subscribe(undefined, { traceId }));
}

export function useServer(id?: TServerId) {
    const traceId = useTraceId();
    const subscribeToComponents = useModule(ModuleSubscribeToCurrentComponentsSnapshot);
    const server$ = useMemo(
        () =>
            isNil(id)
                ? of(createSyncedValueDescriptor(undefined))
                : subscribeToComponents(undefined, { traceId }).pipe(
                      mapValueDescriptor(({ value }) => {
                          return createSyncedValueDescriptor(
                              value.servers.find((server) => server.id === id),
                          );
                      }),
                      distinctValueDescriptorUntilChanged(),
                  ),
        [id, subscribeToComponents, traceId],
    );

    return useValueDescriptorObservable(server$);
}
