import type { TimeZone } from '@common/types';
import type { ReactElement } from 'react';

import { ETableIds } from '../../../modules/clientTableFilters/data.ts';
import type { TSocketSubscriptionState } from '../../../modules/subscriptionsState/module.ts';
import { AgTable } from '../../AgTable/AgTable.tsx';
import { AgTableWithRouterSync } from '../../AgTable/AgTableWithRouterSync.tsx';
import { useColumns } from './columns.tsx';

export type TTableSubscriptionsProps = {
    tableWithRouterSync?: boolean;
    subscriptions: TSocketSubscriptionState[];
    timeZone: TimeZone;
    onOpenEditor: (content: string) => void;
};

export const TableSubscriptions = (props: TTableSubscriptionsProps): ReactElement => {
    const columns = useColumns(props.timeZone, props.onOpenEditor);

    return props.tableWithRouterSync ? (
        <AgTableWithRouterSync
            id={ETableIds.Subscriptions}
            rowKey="key"
            rowData={props.subscriptions}
            columnDefs={columns}
            rowSelection="multiple"
        />
    ) : (
        <AgTable
            rowKey="key"
            rowData={props.subscriptions}
            columnDefs={columns}
            rowSelection="multiple"
        />
    );
};
