import type { TInstrumentDynamicData } from '@backend/bff/src/modules/instruments/schemas/defs';
import type { TimeZone } from '@common/types';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useAgGridServerRowModel } from '@frontend/common/src/components/AgTable/hooks/useAgGridServerRowModel.ts';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { ESortOrder } from '@frontend/common/src/types/domain/pagination.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import type { Observable } from 'rxjs';

import { useGetInstrumentsListContextMenuItems } from '../hooks/useGetInstrumentsListContextMenuItems.ts';
import { cnRoot } from '../view.css';
import { useColumns } from './hooks/useColumns.ts';

export function TableInstrumentsDynamicData({
    subscribeToInstrumentsDynamicDataViewport,
    timeZone,
    showInstrumentsDetails,
    showProviderInstrumentsDetails,
    showInstrumentsRevisions,
    showProviderInstrumentsRevisions,
}: {
    subscribeToInstrumentsDynamicDataViewport: (params: {
        pagination: { limit: number; offset: number };
        filter: Record<keyof TInstrumentDynamicData, { filterType: string }>;
        sort: {
            field: keyof TInstrumentDynamicData;
            sort: ESortOrder;
        }[];
    }) => Observable<TValueDescriptor2<{ rows: TInstrumentDynamicData[]; total?: number }>>;
    timeZone: TimeZone;
    showInstrumentsDetails: (instruments: TInstrumentDynamicData[]) => Promise<boolean>;
    showProviderInstrumentsDetails: (instruments: TInstrumentDynamicData[]) => Promise<boolean>;
    showInstrumentsRevisions: (instruments: TInstrumentDynamicData[]) => Promise<boolean>;
    showProviderInstrumentsRevisions: (instruments: TInstrumentDynamicData[]) => Promise<boolean>;
}) {
    const columns = useColumns(timeZone);

    const params = useAgGridServerRowModel(subscribeToInstrumentsDynamicDataViewport);

    const getContextMenuItems = useGetInstrumentsListContextMenuItems({
        showInstrumentsDetails,
        showProviderInstrumentsDetails,
        showInstrumentsRevisions,
        showProviderInstrumentsRevisions,
    });

    return (
        <div className={cnRoot}>
            <AgTableWithRouterSync<TInstrumentDynamicData>
                id={ETableIds.InstrumentsDynamicData}
                rowKey="id"
                columnDefs={columns}
                rowSelection="multiple"
                getContextMenuItems={getContextMenuItems}
                {...params}
            />
        </div>
    );
}
