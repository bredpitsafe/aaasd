import type { RowClassParams } from '@frontend/ag-grid';
import cn from 'classnames';
import type { Properties } from 'csstype';
import { isEmpty } from 'lodash-es';
import { memo, useMemo } from 'react';

import { useModule } from '../../di/react';
import type { ETableIds, TTableId } from '../../modules/clientTableFilters/data';
import { ModuleSocketServerTime } from '../../modules/socketServerTime';
import type { TBacktestingRunId } from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import { EMPTY_ARRAY, EMPTY_MAP } from '../../utils/const';
import type { TCustomViewCompiledTableContent } from '../../utils/CustomView/parsers/defs';
import { useFunction } from '../../utils/React/useFunction';
import { cnTable } from '../AgTable/AgTable.css';
import { AgTableWithRouterSync } from '../AgTable/AgTableWithRouterSync';
import { useLastIndicatorsMap } from '../hooks/useLastIndicators';
import { cnHiddenHeader } from './ConnectedCustomViewTable.css';
import type { TRow } from './hooks/defs';
import { useBuildColumnProps } from './hooks/useBuildColumnProps';
import { useDatasource } from './hooks/useDatasource';
import { useNowMillisecondsForLiveCell } from './useNowMillisecondsForLiveCell';
import type { TIndicatorsMap } from './utils';
import { applyCondition, getQueriesFromIndicators } from './utils';

export type TCustomViewTableProps = {
    tableId: ETableIds | TTableId;
    className?: string;
    statusStyle?: Properties;
    table: TCustomViewCompiledTableContent;
    url: TSocketURL;
    backtestingRunId?: TBacktestingRunId;
};

export const ConnectedCustomViewTable = memo(
    ({ tableId, className, table, url, backtestingRunId }: TCustomViewTableProps) => {
        const { getServerTime$ } = useModule(ModuleSocketServerTime);

        const indicatorQueries = useMemo(
            () =>
                getQueriesFromIndicators(table.allIndicators).map((query) => ({
                    ...query,
                    backtestingRunId,
                })),
            [backtestingRunId, table.allIndicators],
        );

        const indicators = useLastIndicatorsMap(indicatorQueries) ?? (EMPTY_MAP as TIndicatorsMap);

        const serverTime$ = useMemo(() => getServerTime$(url), [getServerTime$, url]);

        const serverNow = useNowMillisecondsForLiveCell(serverTime$, table.hasTimeout);

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const functionCacheMap = useMemo(() => new Map<string, unknown>(), [table.scope]);

        const tableParameters = useMemo(
            () =>
                applyCondition(
                    functionCacheMap,
                    table.parameters,
                    table.conditions,
                    table.scope,
                    indicators,
                    serverNow,
                    backtestingRunId,
                ),
            [functionCacheMap, table, indicators, serverNow, backtestingRunId],
        );

        const dataSource = useDatasource(
            functionCacheMap,
            table,
            indicators,
            serverNow,
            backtestingRunId,
        );
        const { columns, autoGroupColumnDef } = useBuildColumnProps(tableParameters);
        const showHeader = useMemo(
            () =>
                !isEmpty(autoGroupColumnDef.headerName) ||
                columns.some(({ headerName }) => !isEmpty(headerName)),
            [columns, autoGroupColumnDef],
        );
        const getRowStyle = useFunction(({ data }: RowClassParams<TRow>) => data?.rowStyles);
        const getDataPath = useFunction(
            (data: TRow) => data?.hierarchy ?? (EMPTY_ARRAY as string[]),
        );

        return (
            <AgTableWithRouterSync
                id={tableId}
                className={cn(cnTable, className, {
                    [cnHiddenHeader]: !showHeader,
                })}
                rowKey="key"
                columnDefs={columns}
                autoGroupColumnDef={autoGroupColumnDef}
                rowData={dataSource}
                treeData
                getDataPath={getDataPath}
                groupDisplayType="singleColumn"
                rowSelection="multiple"
                getRowStyle={getRowStyle}
                headerHeight={showHeader ? undefined : 0}
            />
        );
    },
);
