import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import type { TWithLiveUpdates } from '@frontend/common/src/components/hooks/useLiveUpdates';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TimeZone } from '@frontend/common/src/types/time';
import type { RowClassParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import { cnHeaderRow, cnTableContainer } from '../style.css';
import { getColumns } from './columns';
import type { TArbStatsDailyAsset } from './types';
import { aggFuncs } from './utils';

export type TArbTableStrategiesProps = TWithLiveUpdates & {
    data?: TArbStatsDailyAsset[];
    timeZone: TimeZone;
};

const autoGroupColDef = {
    headerName: 'Strategy',
};

export function ArbStatsDailyStrategies(props: TArbTableStrategiesProps): ReactElement {
    const columns = useMemo(() => getColumns(props.timeZone), [props.timeZone]);

    const rowClassRules = useMemo(
        () => ({
            [cnHeaderRow]: (params: RowClassParams<TArbStatsDailyAsset>) => isNil(params.data),
        }),
        [],
    );

    return (
        <div className={cnTableContainer}>
            <AgTableWithRouterSync
                id={ETableIds.ARBDaily}
                rowData={props.data}
                rowKey="key"
                columnDefs={columns}
                rowSelection="multiple"
                autoGroupColumnDef={autoGroupColDef}
                suppressAggFuncInHeader
                aggFuncs={aggFuncs}
                valueCache
                rowClassRules={rowClassRules}
                rowGroupPanelShow="never"
            />
        </div>
    );
}
