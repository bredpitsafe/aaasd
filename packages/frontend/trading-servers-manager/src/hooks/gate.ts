import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId.ts';
import { ModuleSubscribeToCurrentComponentsSnapshot } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToCurrentComponentsSnapshot.ts';
import type { TGate, TGateId } from '@frontend/common/src/types/domain/gates';
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

/**
 * @public
 */
export function useCurrentGateId(): TGate['id'] | undefined {
    const params = useRouteParams();
    return params?.gate;
}

export function useCurrentGate(): TValueDescriptor2<undefined | TGate> {
    return useGate(useCurrentGateId());
}

/**
 * @public
 */
export function useGate(id?: TGateId): TValueDescriptor2<undefined | TGate> {
    const desc = useGates(toArrayIfNotNil(id));
    return isSyncedValueDescriptor(desc) ? createSyncedValueDescriptor(desc.value?.[0]) : desc;
}

export function useGates(ids?: TGateId[]): TValueDescriptor2<undefined | TGate[]> {
    const traceId = useTraceId();
    const subscribeToComponents = useModule(ModuleSubscribeToCurrentComponentsSnapshot);
    const gates$ = useMemo(
        (): Observable<TValueDescriptor2<undefined | TGate[]>> =>
            isNil(ids)
                ? of(createSyncedValueDescriptor(undefined))
                : subscribeToComponents(undefined, { traceId }).pipe(
                      mapValueDescriptor(({ value }) => {
                          return createSyncedValueDescriptor(
                              value.gates.filter((gate) => ids.includes(gate.id)),
                          );
                      }),
                      distinctValueDescriptorUntilChanged(),
                  ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ids?.join(''), subscribeToComponents, traceId],
    );

    return useValueDescriptorObservable(gates$);
}
