import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { TimeZone } from '@frontend/common/src/types/time';

import { THerodotusTrade } from '../../types/domain';
import { useColumns } from './columns';

export function TableTrades(props: { trades: THerodotusTrade[] | undefined; timeZone: TimeZone }) {
    const columns = useColumns(props.timeZone);
    return (
        <AgTableWithRouterSync
            id={ETableIds.Trades}
            rowKey="id"
            rowData={props.trades}
            columnDefs={columns}
        />
    );
}
