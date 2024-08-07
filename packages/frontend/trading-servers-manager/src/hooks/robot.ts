import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId.ts';
import { ModuleSubscribeToCurrentComponentsSnapshot } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToCurrentComponentsSnapshot.ts';
import type { TRobot, TRobotId } from '@frontend/common/src/types/domain/robots';
import { isHerodotus } from '@frontend/common/src/utils/domain/isHerodotus.ts';
import { useValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    distinctValueDescriptorUntilChanged,
    mapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { toArrayIfNotNil } from '@frontend/common/src/utils/toArrayIfNotNil.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

import { useRouteParams } from './useRouteParams';

export function useCurrentRobotId(): TRobot['id'] | undefined {
    const params = useRouteParams();
    return params?.robot;
}

export function useCurrentRobot(): TValueDescriptor2<undefined | TRobot> {
    const robotId = useCurrentRobotId();
    return useRobot(robotId);
}

export function useRobot(id?: TRobotId): TValueDescriptor2<undefined | TRobot> {
    const desc = useRobots(toArrayIfNotNil(id));
    return isSyncedValueDescriptor(desc) ? createSyncedValueDescriptor(desc.value?.[0]) : desc;
}

export function useRobots(ids?: TRobotId[]): TValueDescriptor2<undefined | TRobot[]> {
    const traceId = useTraceId();
    const subscribeToComponents = useModule(ModuleSubscribeToCurrentComponentsSnapshot);
    const robots$ = useMemo(
        (): Observable<TValueDescriptor2<undefined | TRobot[]>> =>
            isNil(ids)
                ? of(createSyncedValueDescriptor(undefined))
                : subscribeToComponents(undefined, { traceId }).pipe(
                      mapValueDescriptor(({ value }) => {
                          return createSyncedValueDescriptor(
                              value.robots.filter((robot) => ids.includes(robot.id)),
                          );
                      }),
                      distinctValueDescriptorUntilChanged(),
                  ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [subscribeToComponents, traceId, ids?.join('')],
    );

    return useValueDescriptorObservable(robots$);
}

export function useHerodotusRobots(): TValueDescriptor2<undefined | TRobot[]> {
    const traceId = useTraceId();
    const subscribeToComponents = useModule(ModuleSubscribeToCurrentComponentsSnapshot);
    const robots$ = useMemo(
        (): Observable<TValueDescriptor2<undefined | TRobot[]>> =>
            subscribeToComponents(undefined, { traceId }).pipe(
                mapValueDescriptor(({ value }) => {
                    return createSyncedValueDescriptor(value.robots.filter(isHerodotus));
                }),
                distinctValueDescriptorUntilChanged(),
            ),
        [subscribeToComponents, traceId],
    );

    return useValueDescriptorObservable(robots$);
}
