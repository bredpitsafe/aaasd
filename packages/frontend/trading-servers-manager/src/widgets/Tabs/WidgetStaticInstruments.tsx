import type {
    TInstrument,
    TInstrumentApprovalStatus,
    TInstrumentDynamicData,
    TInstrumentKind,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { generateTraceId } from '@common/utils';
import type { ColDefField } from '@frontend/ag-grid';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleBFF } from '@frontend/common/src/modules/bff';
import { ModuleSubscribeToInstruments } from '@frontend/common/src/modules/instruments/ModuleSubscribeToInstruments.ts';
import { ModuleSubscribeToInstrumentsDynamicData } from '@frontend/common/src/modules/instruments/ModuleSubscribeToInstrumentsDynamicData.ts';
import { ModuleMock } from '@frontend/common/src/modules/mock';
import type { ESortOrder } from '@frontend/common/src/types/domain/pagination.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

import { TableStaticInstruments } from '../../components/Tables/TableStaticInstruments/view.tsx';
import { useApproveInstruments } from '../hooks/useApproveInstruments.tsx';
import { useShowInstrumentsDetails } from '../hooks/useShowInstrumentsDetails.ts';
import { useShowInstrumentsRevisions } from '../hooks/useShowInstrumentsRevisions.ts';
import { useShowProviderInstrumentsDetails } from '../hooks/useShowProviderInstrumentsDetails.ts';
import { useShowProviderInstrumentsRevisions } from '../hooks/useShowProviderInstrumentsRevisions.ts';

export function WidgetStaticInstruments() {
    const subscribeToInstruments$ = useModule(ModuleSubscribeToInstruments);
    const subscribeToInstrumentsDynamicData = useModule(ModuleSubscribeToInstrumentsDynamicData);
    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);
    const { mock$ } = useModule(ModuleMock);

    const bffSocket = useSyncObservable(
        useMemo(() => getCurrentBFFSocket$(), [getCurrentBFFSocket$]),
    );
    const mock = useSyncObservable(mock$);

    const subscribeToInstrumentsViewport = useCallback(
        (params: {
            pagination: { limit: number; offset: number };
            filter: Record<
                ColDefField<TInstrument>,
                { filterType: string } & Record<string, unknown>
            >;
            sort: {
                field: keyof TInstrument;
                sort: ESortOrder;
            }[];
        }): Observable<TValueDescriptor2<{ rows: TInstrument[]; total?: number }>> => {
            if (isNil(bffSocket)) {
                return of(WAITING_VD);
            }

            const nameRegex =
                isNil(params.filter.name) || isEmpty(params.filter.name.filter)
                    ? undefined
                    : (params.filter.name.filter as string);

            const approvalStatuses =
                isNil(params.filter.approvalStatus) || isEmpty(params.filter.approvalStatus.values)
                    ? undefined
                    : (params.filter.approvalStatus.values as TInstrumentApprovalStatus[]);

            const kinds =
                isNil(params.filter['kind.type']) || isEmpty(params.filter['kind.type'].values)
                    ? undefined
                    : (params.filter['kind.type'].values as TInstrumentKind[]);

            const exchangeRegex =
                isNil(params.filter.exchange) || isEmpty(params.filter.exchange.filter)
                    ? undefined
                    : (params.filter.exchange.filter as string);

            return subscribeToInstruments$(
                {
                    target: bffSocket,
                    mock,
                    pagination: params.pagination,
                    sort: params.sort,
                    filter: { nameRegex, approvalStatuses, kinds, exchangeRegex },
                },
                { traceId: generateTraceId() },
            );
        },
        [bffSocket, subscribeToInstruments$, mock],
    );

    const subscribeToInstrumentDynamicData = useCallback(
        (
            instrumentId: number,
        ): Observable<TValueDescriptor2<TInstrumentDynamicData | undefined>> => {
            if (isNil(bffSocket)) {
                return of(WAITING_VD);
            }

            return subscribeToInstrumentsDynamicData(
                {
                    target: bffSocket,
                    sort: [],
                    filters: { instrumentIds: [instrumentId] },
                    pagination: { limit: 1, offset: 0 },
                    mock,
                },
                { traceId: generateTraceId() },
            ).pipe(
                mapValueDescriptor(({ value: { rows } }) => createSyncedValueDescriptor(rows[0])),
            );
        },
        [bffSocket, subscribeToInstrumentsDynamicData, mock],
    );

    const approveInstruments = useApproveInstruments();

    const showInstrumentsDetails = useShowInstrumentsDetails();
    const showProviderInstrumentsDetails = useShowProviderInstrumentsDetails();
    const showInstrumentsRevisions = useShowInstrumentsRevisions();
    const showProviderInstrumentsRevisions = useShowProviderInstrumentsRevisions();

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return (
        <TableStaticInstruments
            subscribeToInstrumentsViewport={subscribeToInstrumentsViewport}
            subscribeToInstrumentDynamicData={subscribeToInstrumentDynamicData}
            timeZone={timeZone}
            approveInstruments={approveInstruments}
            showInstrumentsDetails={showInstrumentsDetails}
            showProviderInstrumentsDetails={showProviderInstrumentsDetails}
            showInstrumentsRevisions={showInstrumentsRevisions}
            showProviderInstrumentsRevisions={showProviderInstrumentsRevisions}
        />
    );
}
