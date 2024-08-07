import type {
    TAsset,
    TAssetApprovalStatus,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { generateTraceId } from '@common/utils';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleBFF } from '@frontend/common/src/modules/bff';
import { ModuleSubscribeToAssets } from '@frontend/common/src/modules/instruments/ModuleSubscribeToAssets.ts';
import { ModuleMock } from '@frontend/common/src/modules/mock';
import type { ESortOrder } from '@frontend/common/src/types/domain/pagination.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

import { TableAssets } from '../../components/Tables/TableAssets/view.tsx';
import { useApproveAsset } from '../hooks/useApproveAsset.tsx';

export function WidgetAssets() {
    const subscribeToAssets$ = useModule(ModuleSubscribeToAssets);
    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);
    const { mock$ } = useModule(ModuleMock);

    const bffSocket = useSyncObservable(
        useMemo(() => getCurrentBFFSocket$(), [getCurrentBFFSocket$]),
    );
    const mock = useSyncObservable(mock$);

    const subscribeToAssetsViewport = useCallback(
        (params: {
            pagination: { limit: number; offset: number };
            filter: Record<keyof TAsset, { filterType: string } & Record<string, unknown>>;
            sort: {
                field: keyof TAsset;
                sort: ESortOrder;
            }[];
        }): Observable<TValueDescriptor2<{ rows: TAsset[]; total?: number }>> => {
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
                    : (params.filter.approvalStatus.values as TAssetApprovalStatus[]);

            return subscribeToAssets$(
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
        [bffSocket, subscribeToAssets$, mock],
    );

    const approveAsset = useApproveAsset();

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return (
        <TableAssets
            subscribeToAssetsViewport={subscribeToAssetsViewport}
            timeZone={timeZone}
            approveAsset={approveAsset}
        />
    );
}
