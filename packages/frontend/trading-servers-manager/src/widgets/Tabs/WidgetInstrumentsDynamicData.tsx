import type { TInstrumentDynamicData } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { generateTraceId } from '@common/utils';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleBFF } from '@frontend/common/src/modules/bff';
import { ModuleSubscribeToInstrumentsDynamicData } from '@frontend/common/src/modules/instruments/ModuleSubscribeToInstrumentsDynamicData.ts';
import { ModuleMock } from '@frontend/common/src/modules/mock';
import type { ESortOrder } from '@frontend/common/src/types/domain/pagination.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

import { TableInstrumentsDynamicData } from '../../components/Tables/TableInstrumentsDynamicData/view.tsx';
import { useShowInstrumentsDetails } from '../hooks/useShowInstrumentsDetails.ts';
import { useShowInstrumentsRevisions } from '../hooks/useShowInstrumentsRevisions.ts';
import { useShowProviderInstrumentsDetails } from '../hooks/useShowProviderInstrumentsDetails.ts';
import { useShowProviderInstrumentsRevisions } from '../hooks/useShowProviderInstrumentsRevisions.ts';

export function WidgetInstrumentsDynamicData() {
    const subscribeToInstrumentsDynamicData = useModule(ModuleSubscribeToInstrumentsDynamicData);
    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);
    const { mock$ } = useModule(ModuleMock);

    const mock = useSyncObservable(mock$);

    const bffSocket = useSyncObservable(
        useMemo(() => getCurrentBFFSocket$(), [getCurrentBFFSocket$]),
    );

    const subscribeToInstrumentsDynamicDataViewport = useCallback(
        (params: {
            pagination: { limit: number; offset: number };
            filter: Record<
                keyof TInstrumentDynamicData,
                { filterType: string } & Record<string, unknown>
            >;
            sort: {
                field: keyof TInstrumentDynamicData;
                sort: ESortOrder;
            }[];
        }): Observable<TValueDescriptor2<{ rows: TInstrumentDynamicData[]; total?: number }>> => {
            if (isNil(bffSocket)) {
                return of(WAITING_VD);
            }

            const nameRegex =
                isNil(params.filter.name) || isEmpty(params.filter.name.filter)
                    ? undefined
                    : (params.filter.name.filter as string);

            return subscribeToInstrumentsDynamicData(
                {
                    target: bffSocket,
                    mock,
                    pagination: params.pagination,
                    sort: params.sort,
                    filters: { nameRegex },
                },
                { traceId: generateTraceId() },
            );
        },
        [bffSocket, subscribeToInstrumentsDynamicData, mock],
    );

    const showInstrumentsDetails = useShowInstrumentsDetails();
    const showProviderInstrumentsDetails = useShowProviderInstrumentsDetails();
    const showInstrumentsRevisions = useShowInstrumentsRevisions();
    const showProviderInstrumentsRevisions = useShowProviderInstrumentsRevisions();

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return (
        <TableInstrumentsDynamicData
            subscribeToInstrumentsDynamicDataViewport={subscribeToInstrumentsDynamicDataViewport}
            timeZone={timeZone}
            showInstrumentsDetails={showInstrumentsDetails}
            showProviderInstrumentsDetails={showProviderInstrumentsDetails}
            showInstrumentsRevisions={showInstrumentsRevisions}
            showProviderInstrumentsRevisions={showProviderInstrumentsRevisions}
        />
    );
}
