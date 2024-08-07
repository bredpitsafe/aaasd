import type { TimeZone } from '@common/types';
import type { RowClassParams } from '@frontend/ag-grid';
import { lowerCaseComparator } from '@frontend/ag-grid/src/comparators/lowerCaseComparator.ts';
import type { TColDef } from '@frontend/ag-grid/src/types.ts';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { groupHeaderNameGetter } from '../../../utils/groupHeaderNameGetter.ts';
import { cnHeaderRow, cnTableContainer } from '../style.css';
import { getColumns } from './columns';
import type { TBalancePnlDailyAsset } from './types';
import { aggFuncs } from './utils';

type TBalancePnlDailyProps = {
    data?: TBalancePnlDailyAsset[];
    timeZone: TimeZone;
};

const autoGroupColDef: TColDef<TBalancePnlDailyAsset> = {
    headerValueGetter: groupHeaderNameGetter,
    sort: 'asc',
    comparator: lowerCaseComparator,
};

export function BalancePnlDaily(props: TBalancePnlDailyProps): ReactElement {
    const columns = useMemo(() => getColumns(props.timeZone), [props.timeZone]);

    const rowClassRules = useMemo(
        () => ({
            [cnHeaderRow]: (params: RowClassParams<TBalancePnlDailyAsset>) => isNil(params.data),
        }),
        [],
    );

    return (
        <div className={cnTableContainer}>
            <AgTableWithRouterSync
                id={ETableIds.PNLDaily}
                rowData={props.data}
                rowKey="key"
                columnDefs={columns}
                rowSelection="multiple"
                autoGroupColumnDef={autoGroupColDef}
                suppressAggFuncInHeader
                valueCache
                rowClassRules={rowClassRules}
                aggFuncs={aggFuncs}
                rowGroupPanelShow="never"
                groupDisplayType="singleColumn"
            />
        </div>
    );
}
