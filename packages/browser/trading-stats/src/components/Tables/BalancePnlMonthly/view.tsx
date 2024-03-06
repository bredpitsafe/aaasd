import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TimeZone } from '@frontend/common/src/types/time';
import { ReactElement } from 'react';

import { useColumns } from './columns';
import { TBalancePnlMonthly } from './types';
import { getAllDates } from './utils';

type TBalancePnlMonthlyProps = {
    data?: TBalancePnlMonthly[];
    timeZone: TimeZone;
};

export function BalancePnlMonthly(props: TBalancePnlMonthlyProps): ReactElement {
    const dates = getAllDates(props.data);
    const columns = useColumns(dates, props.timeZone);

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
        />
    );
}
