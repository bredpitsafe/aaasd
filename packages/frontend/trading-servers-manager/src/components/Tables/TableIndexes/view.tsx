import type { TIndex } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
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
import { useProviderIndexDetailsProps } from './hooks/useProviderIndexDetailsProps.ts';

export function TableIndexes({
    subscribeToIndexesViewport,
    timeZone,
    approveIndex,
}: {
    subscribeToIndexesViewport: (params: {
        pagination: { limit: number; offset: number };
        filter: Record<keyof TIndex, { filterType: string }>;
        sort: {
            field: keyof TIndex;
            sort: ESortOrder;
        }[];
    }) => Observable<TValueDescriptor2<{ rows: TIndex[]; total?: number }>>;
    timeZone: TimeZone;
    approveIndex: (index: TIndex) => Promise<boolean>;
}) {
    const columns = useColumns(timeZone);

    const params = useAgGridServerRowModel(subscribeToIndexesViewport);
    const instrumentDetailsParams = useProviderIndexDetailsProps(timeZone);

    const getContextMenuItems = useGetContextMenuItems({ approveIndex });

    return (
        <div className={cnRoot}>
            <AgTableWithRouterSync<TIndex>
                id={ETableIds.Indexes}
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
