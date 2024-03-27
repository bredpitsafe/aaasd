import { ColDef } from '@frontend/ag-grid';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { AgTable } from '@frontend/common/src/components/AgTable/AgTable';
import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { TWithClassname } from '@frontend/common/src/types/components';
import { TimeZone } from '@frontend/common/src/types/time';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import cn from 'classnames';
import { isUndefined } from 'lodash-es';
import { memo, useMemo } from 'react';

import { TRequestQuery } from '../../domain/RequestQuery';
import { cnTable } from './style.css';

const svgDelete = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/delete.svg') as string,
);
const getColumns: (timeZone: TimeZone) => Array<ColDef<TRequestQuery>> = (timeZone) => [
    {
        field: 'name',
        headerName: 'Name',
        filter: EColumnFilterType.text,
        floatingFilter: true,
    },
    {
        field: 'lastRequestTs',
        headerName: 'Last Used',
        sort: 'desc',
        hide: true,
        valueFormatter: dateFormatter(timeZone),
    },
];

type TProps = TWithClassname & {
    queries: TRequestQuery[];
    onSelect: (v: TRequestQuery) => void;
    onDelete: (v: TRequestQuery) => void;
};

export const QueriesMenu = memo((props: TProps) => {
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.WSQueryTerminal);
    const columns = useMemo(() => getColumns(timeZone), [timeZone]);

    return (
        <AgTable<TRequestQuery>
            className={cn(cnTable, props.className)}
            rowKey="id"
            rowData={props.queries}
            columnDefs={columns}
            rowSelection="single"
            onRowClicked={(v) => {
                const selected = v.node.data;
                if (isUndefined(selected)) return;
                props.onSelect(selected);
            }}
            getContextMenuItems={(params) => {
                const selected = params.node?.data;
                if (isUndefined(selected)) return [];
                return [
                    {
                        icon: svgDelete,
                        name: 'Delete',
                        action: () => {
                            props.onDelete(selected);
                        },
                    },
                ];
            }}
        />
    );
});
