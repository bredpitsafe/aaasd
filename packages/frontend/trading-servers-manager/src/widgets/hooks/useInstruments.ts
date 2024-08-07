import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleBFF } from '@frontend/common/src/modules/bff';
import { ModuleSubscribeToInstruments } from '@frontend/common/src/modules/instruments/ModuleSubscribeToInstruments.ts';
import { ModuleMock } from '@frontend/common/src/modules/mock';
import { Fail } from '@frontend/common/src/types/Fail.ts';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
    matchValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil } from 'lodash-es';
import { useMemo, useRef } from 'react';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

export function useInstruments(instrumentIds: number[]): TValueDescriptor2<TInstrument[]> {
    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);
    const { mock$ } = useModule(ModuleMock);

    const subscribeToInstruments = useModule(ModuleSubscribeToInstruments);

    const mock = useSyncObservable(mock$);

    const bffSocket = useSyncObservable(
        useMemo(() => getCurrentBFFSocket$(), [getCurrentBFFSocket$]),
    );

    const initialRequestInstrumentIds = useRef(instrumentIds);

    const requestInstrumentIds = useMemo(() => {
        if (
            instrumentIds.every((instrumentId) =>
                initialRequestInstrumentIds.current.includes(instrumentId),
            )
        ) {
            return initialRequestInstrumentIds.current;
        }

        initialRequestInstrumentIds.current = instrumentIds;
        return instrumentIds;
    }, [instrumentIds]);

    const fullInstruments$ = useMemo<Observable<TValueDescriptor2<TInstrument[]>>>(() => {
        if (isNil(bffSocket)) {
            return of(WAITING_VD);
        }

        if (isEmpty(requestInstrumentIds)) {
            return of(createSyncedValueDescriptor([]));
        }

        return subscribeToInstruments(
            {
                target: bffSocket,
                mock,
                pagination: { limit: requestInstrumentIds.length, offset: 0 },
                sort: [],
                filter: { instrumentIds: requestInstrumentIds },
            },
            { traceId: generateTraceId() },
        ).pipe(
            mapValueDescriptor(
                ({ value: { rows: instruments } }): TValueDescriptor2<TInstrument[]> => {
                    if (instruments.length !== requestInstrumentIds.length) {
                        return createUnsyncedValueDescriptor(
                            Fail(EGrpcErrorCode.DATA_LOSS, {
                                message: `Requested ${requestInstrumentIds.length} instruments, but got ${instruments.length} instruments`,
                            }),
                        );
                    }

                    return createSyncedValueDescriptor(
                        instruments.sort(
                            ({ id: firstId }, { id: nextId }) =>
                                requestInstrumentIds.indexOf(firstId) -
                                requestInstrumentIds.indexOf(nextId),
                        ),
                    );
                },
            ),
        );
    }, [bffSocket, requestInstrumentIds, mock, subscribeToInstruments]);

    const instrumentDesc = useNotifiedValueDescriptorObservable(fullInstruments$);

    return useMemo(
        () =>
            matchValueDescriptor(instrumentDesc, ({ value }) =>
                createSyncedValueDescriptor(value.filter(({ id }) => instrumentIds.includes(id))),
            ),
        [instrumentDesc, instrumentIds],
    );
}
