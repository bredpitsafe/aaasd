import type { TimeZone } from '@common/types';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { autoGroupColumnDef, useColumns } from './columns';
import type { TArbMonthlyStrategy } from './types';
import { aggFuncs, getAllDates, getRowClassRules } from './utils';

type TArbStatsMonthlyProps = TWithClassname & {
    data?: TArbMonthlyStrategy[];
    timeZone: TimeZone;
    groupIncludeTotalFooter?: boolean;
};

export function ArbStatsMonthly(props: TArbStatsMonthlyProps): ReactElement {
    const { data, timeZone, groupIncludeTotalFooter } = props;
    const dates = useMemo(() => getAllDates(data), [data]);

    const columns = useColumns({ dates, data, timeZone });

    const rowClassRules = useMemo(() => getRowClassRules(), []);

    return (
        <AgTableWithRouterSync
            id={ETableIds.ARBMonthly}
            rowKey="key"
            columnDefs={columns}
            rowData={data}
            rowClassRules={rowClassRules}
            suppressRowVirtualisation
            suppressColumnVirtualisation
            domLayout="autoHeight"
            rowGroupPanelShow="never"
            groupDisplayType="singleColumn"
            aggFuncs={aggFuncs}
            suppressAggFuncInHeader
            autoGroupColumnDef={autoGroupColumnDef}
            rowSelection="multiple"
            tooltipShowDelay={0}
            tooltipHideDelay={2000}
            groupIncludeTotalFooter={groupIncludeTotalFooter}
        />
    );
}
