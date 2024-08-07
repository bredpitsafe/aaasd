import type {
    TIndex,
    TIndexApprovalStatus,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { generateTraceId } from '@common/utils';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleBFF } from '@frontend/common/src/modules/bff';
import { ModuleSubscribeToIndexes } from '@frontend/common/src/modules/instruments/ModuleSubscribeToIndexes.ts';
import { ModuleMock } from '@frontend/common/src/modules/mock';
import type { ESortOrder } from '@frontend/common/src/types/domain/pagination.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

import { TableIndexes } from '../../components/Tables/TableIndexes/view.tsx';
import { useApproveIndex } from '../hooks/useApproveIndex.tsx';

export function WidgetIndexes() {
    const subscribeToIndexes$ = useModule(ModuleSubscribeToIndexes);
    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);
    const { mock$ } = useModule(ModuleMock);

    const bffSocket = useSyncObservable(
        useMemo(() => getCurrentBFFSocket$(), [getCurrentBFFSocket$]),
    );
    const mock = useSyncObservable(mock$);

    const subscribeToIndexesViewport = useCallback(
        (params: {
            pagination: { limit: number; offset: number };
            filter: Record<keyof TIndex, { filterType: string } & Record<string, unknown>>;
            sort: {
                field: keyof TIndex;
                sort: ESortOrder;
            }[];
        }): Observable<TValueDescriptor2<{ rows: TIndex[]; total?: number }>> => {
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
                    : (params.filter.approvalStatus.values as TIndexApprovalStatus[]);

            return subscribeToIndexes$(
                {
                    target: bffSocket,
                    mock,
                    pagination: params.pagination,
                    sort: params.sort,
                    filter: { nameRegex, approvalStatuses },
                },
                { traceId: generateTraceId() },
            );
        },
        [bffSocket, subscribeToIndexes$, mock],
    );

    const approveIndex = useApproveIndex();

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return (
        <TableIndexes
            subscribeToIndexesViewport={subscribeToIndexesViewport}
            timeZone={timeZone}
            approveIndex={approveIndex}
        />
    );
}
