import type { TAsset } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TimeZone } from '@common/types';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useAgGridServerRowModel } from '@frontend/common/src/components/AgTable/hooks/useAgGridServerRowModel.ts';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { ESortOrder } from '@frontend/common/src/types/domain/pagination.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import type { Observable } from 'rxjs';

import { cnRoot } from '../view.css';
import { useColumns } from './hooks/useColumns.ts';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems.ts';
import { useProviderAssetDetailsProps } from './hooks/useProviderAssetDetailsProps.ts';

export function TableAssets({
    subscribeToAssetsViewport,
    timeZone,
    approveAsset,
}: {
    subscribeToAssetsViewport: (params: {
        pagination: { limit: number; offset: number };
        filter: Record<keyof TAsset, { filterType: string }>;
        sort: {
            field: keyof TAsset;
            sort: ESortOrder;
        }[];
    }) => Observable<TValueDescriptor2<{ rows: TAsset[]; total?: number }>>;
    timeZone: TimeZone;
    approveAsset: (asset: TAsset) => Promise<boolean>;
}) {
    const columns = useColumns(timeZone);

    const params = useAgGridServerRowModel(subscribeToAssetsViewport);
    const instrumentDetailsParams = useProviderAssetDetailsProps(timeZone);

    const getContextMenuItems = useGetContextMenuItems({ approveAsset });

    return (
        <div className={cnRoot}>
            <AgTableWithRouterSync<TAsset>
                id={ETableIds.Assets}
                rowKey="name"
                columnDefs={columns}
                rowSelection="multiple"
                getContextMenuItems={getContextMenuItems}
                {...params}
                {...instrumentDetailsParams}
            />
        </div>
    );
}
