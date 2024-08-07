import type {
    TInstrument,
    TInstrumentDynamicData,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TimeZone } from '@common/types';
import type { ColDefField } from '@frontend/ag-grid';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useAgGridServerRowModel } from '@frontend/common/src/components/AgTable/hooks/useAgGridServerRowModel.ts';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { ESortOrder } from '@frontend/common/src/types/domain/pagination.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import type { Observable } from 'rxjs';

import { useGetInstrumentsListContextMenuItems } from '../hooks/useGetInstrumentsListContextMenuItems.ts';
import { cnRoot } from '../view.css';
import { DynamicDataContext } from './DynamicDataContext.ts';
import { useColumns } from './hooks/useColumns.ts';
import { useProviderInstrumentDetailsProps } from './hooks/useProviderInstrumentDetailsProps.ts';

export function TableStaticInstruments({
    subscribeToInstrumentsViewport,
    subscribeToInstrumentDynamicData,
    timeZone,
    approveInstruments,
    showInstrumentsDetails,
    showProviderInstrumentsDetails,
    showInstrumentsRevisions,
    showProviderInstrumentsRevisions,
}: {
    subscribeToInstrumentsViewport: (params: {
        pagination: { limit: number; offset: number };
        filter: Record<ColDefField<TInstrument>, { filterType: string }>;
        sort: {
            field: keyof TInstrument;
            sort: ESortOrder;
        }[];
    }) => Observable<TValueDescriptor2<{ rows: TInstrument[]; total?: number }>>;
    subscribeToInstrumentDynamicData: (
        instrumentId: number,
    ) => Observable<TValueDescriptor2<TInstrumentDynamicData | undefined>>;
    timeZone: TimeZone;
    approveInstruments: (instruments: TInstrument[]) => Promise<boolean>;
    showInstrumentsDetails: (instruments: TInstrument[]) => Promise<boolean>;
    showProviderInstrumentsDetails: (instruments: TInstrument[]) => Promise<boolean>;
    showInstrumentsRevisions: (instruments: TInstrument[]) => Promise<boolean>;
    showProviderInstrumentsRevisions: (instruments: TInstrument[]) => Promise<boolean>;
}) {
    const columns = useColumns(timeZone);

    const params = useAgGridServerRowModel(subscribeToInstrumentsViewport);
    const instrumentDetailsParams = useProviderInstrumentDetailsProps(timeZone);

    const getContextMenuItems = useGetInstrumentsListContextMenuItems({
        approveInstruments,
        showInstrumentsDetails,
        showProviderInstrumentsDetails,
        showInstrumentsRevisions,
        showProviderInstrumentsRevisions,
    });

    return (
        <div className={cnRoot}>
            <DynamicDataContext.Provider value={subscribeToInstrumentDynamicData}>
                <AgTableWithRouterSync<TInstrument>
                    id={ETableIds.InstrumentsStaticData}
                    rowKey="id"
                    columnDefs={columns}
                    rowSelection="multiple"
                    getContextMenuItems={getContextMenuItems}
                    {...params}
                    {...instrumentDetailsParams}
                />
            </DynamicDataContext.Provider>
        </div>
    );
}
