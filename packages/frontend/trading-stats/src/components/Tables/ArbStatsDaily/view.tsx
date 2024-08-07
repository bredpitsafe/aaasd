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
import type { TArbStatsDailyAsset } from './types';
import { aggFuncs } from './utils';

type TArbTableStrategiesProps = {
    data?: TArbStatsDailyAsset[];
    timeZone: TimeZone;
};

const autoGroupColDef: TColDef<TArbStatsDailyAsset> = {
    headerValueGetter: groupHeaderNameGetter,
    sort: 'asc',
    comparator: lowerCaseComparator,
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
                groupDisplayType="singleColumn"
            />
        </div>
    );
}
