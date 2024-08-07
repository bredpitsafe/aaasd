import type { TimeZone } from '@common/types';
import { lowerCaseComparator } from '@frontend/ag-grid/src/comparators/lowerCaseComparator.ts';
import type { TColDef } from '@frontend/ag-grid/src/types.ts';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { groupHeaderNameGetter } from '../../../utils/groupHeaderNameGetter.ts';
import { useColumns } from './columns';
import type { TBalancePnlMonthly } from './types';
import { aggFuncs, getAllDates, getRowClassRules } from './utils';

type TBalancePnlMonthlyProps = {
    data?: TBalancePnlMonthly[];
    timeZone: TimeZone;
};

const autoGroupColDef: TColDef<TBalancePnlMonthly> = {
    headerValueGetter: groupHeaderNameGetter,
    sort: 'asc',
    comparator: lowerCaseComparator,
};

export function BalancePnlMonthly(props: TBalancePnlMonthlyProps): ReactElement {
    const dates = getAllDates(props.data);
    const columns = useColumns(props.data, dates, props.timeZone);

    const rowClassRules = useMemo(() => getRowClassRules(), []);

    return (
        <AgTableWithRouterSync
            id={ETableIds.PNLMonthly}
            rowKey="name"
            columnDefs={columns}
            rowData={props.data}
            suppressRowVirtualisation
            suppressColumnVirtualisation
            domLayout="autoHeight"
            rowSelection="multiple"
            aggFuncs={aggFuncs}
            suppressAggFuncInHeader
            groupIncludeTotalFooter={(props.data?.length ?? 0) > 1}
            autoGroupColumnDef={autoGroupColDef}
            groupDisplayType="singleColumn"
            rowClassRules={rowClassRules}
        />
    );
}
