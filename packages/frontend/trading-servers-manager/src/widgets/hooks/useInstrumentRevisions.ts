import type { TInstrumentRevision } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { useDeepEqualProp } from '@frontend/common/src/hooks/useDeepEqualProp.ts';
import { ModuleBFF } from '@frontend/common/src/modules/bff';
import { ModuleSubscribeToInstrumentRevisionsWithSnapshot } from '@frontend/common/src/modules/instruments/ModuleSubscribeToInstrumentRevisionsWithSnapshot.ts';
import { ModuleMock } from '@frontend/common/src/modules/mock';
import { EMPTY_MAP } from '@frontend/common/src/utils/const.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    combineLatestValueDescriptors,
    mapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil, isNumber, uniq } from 'lodash-es';
import { useMemo } from 'react';
import { of } from 'rxjs';

import type { TRevisionInstrument } from '../../modules/router/defs.ts';

export function useInstrumentRevisions(
    revisionInstrumentsIds: TRevisionInstrument[],
): TValueDescriptor2<ReadonlyMap<number, TInstrumentRevision[]>> {
    const instrumentIds = useDeepEqualProp(
        useMemo(
            () =>
                uniq(
                    revisionInstrumentsIds.map((detailsInstrumentId) =>
                        isNumber(detailsInstrumentId)
                            ? detailsInstrumentId
                            : detailsInstrumentId.instrumentId,
                    ),
                ).sort(),
            [revisionInstrumentsIds],
        ),
    );

    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);
    const { mock$ } = useModule(ModuleMock);

    const subscribeRevisions = useModule(ModuleSubscribeToInstrumentRevisionsWithSnapshot);

    const mock = useSyncObservable(mock$);

    const bffSocket = useSyncObservable(
        useMemo(() => getCurrentBFFSocket$(), [getCurrentBFFSocket$]),
    );

    return useNotifiedValueDescriptorObservable(
        useMemo(() => {
            if (isNil(bffSocket)) {
                return of(WAITING_VD);
            }

            if (isEmpty(instrumentIds)) {
                return of(
                    createSyncedValueDescriptor(EMPTY_MAP) as TValueDescriptor2<
                        ReadonlyMap<number, TInstrumentRevision[]>
                    >,
                );
            }

            return combineLatestValueDescriptors(
                instrumentIds.map((instrumentId) =>
                    subscribeRevisions(
                        {
                            instrumentId,
                            target: bffSocket,
                            mock,
                        },
                        { traceId: generateTraceId() },
                    ),
                ),
            ).pipe(
                mapValueDescriptor(({ value }) =>
                    createSyncedValueDescriptor(
                        new Map(value.map((revisions) => [revisions[0].instrumentId, revisions])),
                    ),
                ),
            );
        }, [instrumentIds, bffSocket, mock, subscribeRevisions]),
    );
}
