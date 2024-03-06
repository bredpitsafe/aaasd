import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import type { TWithLiveUpdates } from '@frontend/common/src/components/hooks/useLiveUpdates';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TimeZone } from '@frontend/common/src/types/time';
import type { RowClassParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import { cnHeaderRow, cnTableContainer } from '../style.css';
import { getColumns } from './columns';
import type { TBalancePnlDailyAsset } from './types';
import { aggFuncs } from './utils';

export type TBalancePnlDailyProps = TWithLiveUpdates & {
    data?: TBalancePnlDailyAsset[];
    timeZone: TimeZone;
};

const autoGroupColDef = {
    headerName: 'Strategy',
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
            />
        </div>
    );
}
