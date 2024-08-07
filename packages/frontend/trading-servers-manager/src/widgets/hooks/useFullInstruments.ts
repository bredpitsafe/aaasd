import type { TStageName } from '@backend/bff/src/def/stages.ts';
import type {
    TInstrument,
    TInstrumentDynamicData,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleBFF } from '@frontend/common/src/modules/bff';
import { ModuleSubscribeToInstruments } from '@frontend/common/src/modules/instruments/ModuleSubscribeToInstruments.ts';
import { ModuleSubscribeToInstrumentsDynamicData } from '@frontend/common/src/modules/instruments/ModuleSubscribeToInstrumentsDynamicData.ts';
import { ModuleMock } from '@frontend/common/src/modules/mock';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { Fail } from '@frontend/common/src/types/Fail.ts';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    combineLatestValueDescriptors,
    mapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
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

export function useFullInstruments(
    instrumentIds: number[],
): TValueDescriptor2<(TInstrument & TInstrumentDynamicData)[]> {
    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const { mock$ } = useModule(ModuleMock);

    const subscribeToInstruments = useModule(ModuleSubscribeToInstruments);
    const subscribeToInstrumentsDynamicData = useModule(ModuleSubscribeToInstrumentsDynamicData);

    const mock = useSyncObservable(mock$);

    const bffSocket = useSyncObservable(
        useMemo(() => getCurrentBFFSocket$(), [getCurrentBFFSocket$]),
    );
    const stageName = useSyncObservable(currentSocketName$ as Observable<TStageName | undefined>);

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

    const fullInstruments$ = useMemo<
        Observable<TValueDescriptor2<(TInstrument & TInstrumentDynamicData)[]>>
    >(() => {
        if (isNil(bffSocket) || isNil(stageName)) {
            return of(WAITING_VD);
        }

        if (isEmpty(requestInstrumentIds)) {
            return of(createSyncedValueDescriptor([]));
        }

        const commonRequestParams = {
            target: bffSocket,
            requestStage: stageName,
            mock,
            pagination: { limit: requestInstrumentIds.length, offset: 0 },
        };

        const options = { traceId: generateTraceId() };

        return combineLatestValueDescriptors([
            subscribeToInstruments(
                {
                    ...commonRequestParams,
                    sort: [],
                    filter: { instrumentIds: requestInstrumentIds },
                },
                options,
            ),
            subscribeToInstrumentsDynamicData(
                {
                    ...commonRequestParams,
                    sort: [],
                    filters: { instrumentIds: requestInstrumentIds },
                },
                options,
            ),
        ]).pipe(
            mapValueDescriptor(
                ({
                    value: [{ rows: instruments }, { rows: dynamicData }],
                }): TValueDescriptor2<(TInstrument & TInstrumentDynamicData)[]> => {
                    if (
                        instruments.length !== requestInstrumentIds.length ||
                        dynamicData.length !== requestInstrumentIds.length
                    ) {
                        return createUnsyncedValueDescriptor(
                            Fail(EGrpcErrorCode.DATA_LOSS, {
                                message: `Requested ${requestInstrumentIds.length} instruments, but got ${instruments.length} instruments and ${dynamicData.length} dynamic data`,
                            }),
                        );
                    }

                    if (instruments.length !== dynamicData.length) {
                        return createUnsyncedValueDescriptor(
                            Fail(EGrpcErrorCode.DATA_LOSS, {
                                message: 'Unequal size of instruments ans their dynamic data',
                            }),
                        );
                    }

                    const dynamicDataMap = new Map(
                        dynamicData.map((dynamicDataItem) => [dynamicDataItem.id, dynamicDataItem]),
                    );

                    if (instruments.some(({ id }) => !dynamicDataMap.has(id))) {
                        return createUnsyncedValueDescriptor(
                            Fail(EGrpcErrorCode.DATA_LOSS, {
                                message: `Can't find dynamic data for instrument`,
                            }),
                        );
                    }

                    return createSyncedValueDescriptor(
                        instruments
                            .map((instrument) => ({
                                ...instrument,
                                ...dynamicDataMap.get(instrument.id)!,
                            }))
                            .sort(
                                ({ id: firstId }, { id: nextId }) =>
                                    requestInstrumentIds.indexOf(firstId) -
                                    requestInstrumentIds.indexOf(nextId),
                            ),
                    );
                },
            ),
        );
    }, [
        bffSocket,
        stageName,
        requestInstrumentIds,
        mock,
        subscribeToInstruments,
        subscribeToInstrumentsDynamicData,
    ]);

    const fullInstrumentDesc = useNotifiedValueDescriptorObservable(fullInstruments$);

    return useMemo(
        () =>
            matchValueDescriptor(fullInstrumentDesc, ({ value }) =>
                createSyncedValueDescriptor(value.filter(({ id }) => instrumentIds.includes(id))),
            ),
        [fullInstrumentDesc, instrumentIds],
    );
}
