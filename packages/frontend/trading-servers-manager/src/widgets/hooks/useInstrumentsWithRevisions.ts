import type { TStageName } from '@backend/bff/src/def/stages.ts';
import type {
    TInstrument,
    TInstrumentRevision,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO } from '@common/types';
import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { useDeepEqualProp } from '@frontend/common/src/hooks/useDeepEqualProp.ts';
import { ModuleBFF } from '@frontend/common/src/modules/bff';
import { ModuleFetchInstrumentsSnapshot } from '@frontend/common/src/modules/instruments/ModuleFetchInstrumentsSnapshot.ts';
import { ModuleSubscribeToInstruments } from '@frontend/common/src/modules/instruments/ModuleSubscribeToInstruments.ts';
import { ModuleMock } from '@frontend/common/src/modules/mock';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { Fail } from '@frontend/common/src/types/Fail.ts';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError.ts';
import { EMPTY_ARRAY, EMPTY_MAP } from '@frontend/common/src/utils/const.ts';
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
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil, isNumber, uniq } from 'lodash-es';
import { useMemo } from 'react';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

import type { TRevisionList } from '../../types/instruments.ts';

export function useInstrumentsWithRevisions(
    instrumentIds: ({ instrumentId: number; platformTime: TRevisionList } | number)[],
): TValueDescriptor2<ReadonlyMap<number, { instrument: TInstrument; platformTime?: ISO }[]>> {
    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const { mock$ } = useModule(ModuleMock);

    const subscribeToInstruments = useModule(ModuleSubscribeToInstruments);
    const fetchInstrumentsSnapshot = useModule(ModuleFetchInstrumentsSnapshot);

    const mock = useSyncObservable(mock$);

    const bffSocket = useSyncObservable(
        useMemo(() => getCurrentBFFSocket$(), [getCurrentBFFSocket$]),
    );
    const stageName = useSyncObservable(currentSocketName$ as Observable<TStageName | undefined>);

    const latestInstrumentsIds = useDeepEqualProp(
        useMemo(
            () => uniq(instrumentIds.map((id) => (isNumber(id) ? id : id.instrumentId))),
            [instrumentIds],
        ),
    );
    const revisionInstruments = useDeepEqualProp(
        useMemo(
            () =>
                instrumentIds
                    .filter(
                        (
                            id,
                        ): id is {
                            instrumentId: number;
                            platformTime: TRevisionList;
                        } =>
                            !isNumber(id) &&
                            (id.platformTime.length > 1 || !isNil(id.platformTime[0])),
                    )
                    .map(({ instrumentId, platformTime }) =>
                        (
                            platformTime.filter(
                                (platformTime): platformTime is ISO => !isNil(platformTime),
                            ) as ISO[]
                        ).map((platformTime) => ({
                            instrumentId,
                            platformTime,
                        })),
                    )
                    .flat(),
            [instrumentIds],
        ),
    );

    return useNotifiedValueDescriptorObservable(
        useMemo(() => {
            if (isNil(bffSocket) || isNil(stageName)) {
                return of(WAITING_VD);
            }

            if (isEmpty(latestInstrumentsIds) && isEmpty(revisionInstruments)) {
                return of(
                    createSyncedValueDescriptor(EMPTY_MAP) as TValueDescriptor2<
                        ReadonlyMap<
                            number,
                            { instrument: TInstrument; revision?: TInstrumentRevision }[]
                        >
                    >,
                );
            }

            const commonRequestParams = {
                target: bffSocket,
                requestStage: stageName,
                mock,
            };

            const options = { traceId: generateTraceId() };

            return combineLatestValueDescriptors([
                isEmpty(latestInstrumentsIds)
                    ? of(createSyncedValueDescriptor(EMPTY_ARRAY as TInstrument[]))
                    : subscribeToInstruments(
                          {
                              ...commonRequestParams,
                              sort: [],
                              filter: { instrumentIds: latestInstrumentsIds },
                              pagination: { limit: latestInstrumentsIds.length, offset: 0 },
                          },
                          options,
                      ).pipe(
                          mapValueDescriptor(
                              ({ value: { rows } }): TValueDescriptor2<TInstrument[]> => {
                                  if (rows.length !== latestInstrumentsIds.length) {
                                      return createUnsyncedValueDescriptor(
                                          Fail(EGrpcErrorCode.DATA_LOSS, {
                                              message: `Requested ${latestInstrumentsIds.length} instruments, but got ${rows.length} instruments`,
                                          }),
                                      );
                                  }

                                  return createSyncedValueDescriptor(rows);
                              },
                          ),
                      ),
                ...revisionInstruments.map(({ instrumentId, platformTime }) =>
                    fetchInstrumentsSnapshot(
                        {
                            ...commonRequestParams,
                            sort: [],
                            filter: { instrumentIds: [instrumentId] },
                            platformTime,
                            pagination: { limit: 1, offset: 0 },
                        },
                        options,
                    ).pipe(
                        mapValueDescriptor(
                            ({
                                value: {
                                    payload: {
                                        snapshot: [instrument],
                                    },
                                },
                            }): TValueDescriptor2<{
                                instrument: TInstrument;
                                platformTime: ISO;
                            }> => {
                                if (isNil(instrument)) {
                                    return createUnsyncedValueDescriptor(
                                        Fail(EGrpcErrorCode.DATA_LOSS, {
                                            message: `Requested instrument with revision, but not found`,
                                        }),
                                    );
                                }

                                return createSyncedValueDescriptor({ instrument, platformTime });
                            },
                        ),
                    ),
                ),
            ]).pipe(
                mapValueDescriptor(({ value }) => {
                    const map = new Map<
                        number,
                        { instrument: TInstrument; platformTime?: ISO }[]
                    >();

                    const [latest, ...revisionInstruments] = value;

                    for (const instrument of latest) {
                        map.set(instrument.id, [{ instrument }]);
                    }

                    for (const { instrument, platformTime } of revisionInstruments) {
                        const items = map.get(instrument.id);

                        if (isNil(items)) {
                            map.set(instrument.id, [{ instrument, platformTime }]);
                        } else {
                            items.push({ instrument, platformTime });
                        }
                    }

                    return createSyncedValueDescriptor(map);
                }),
            );
        }, [
            bffSocket,
            stageName,
            mock,
            latestInstrumentsIds,
            subscribeToInstruments,
            revisionInstruments,
            fetchInstrumentsSnapshot,
        ]),
    );
}
