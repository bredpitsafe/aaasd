import cn from 'classnames';
import type { Properties } from 'csstype';
import cxs from 'cxs';
import { isEmpty, isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { useModule } from '../../di/react';
import { ModuleSocketServerTime } from '../../modules/socketServerTime';
import type { TBacktestingRunId } from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import { EMPTY_MAP } from '../../utils/const';
import { EApplicationOwner } from '../../utils/CustomView/defs';
import type { TCustomViewCompiledTableContent } from '../../utils/CustomView/parsers/defs';
import { useFunction } from '../../utils/React/useFunction';
import { useLastIndicatorsMap } from '../hooks/useLastIndicators';
import { Table } from '../Table';
import { styleTableLegacy } from '../Table/styles';
import { cnDashboard, cnTable, cnTSM } from './ConnectedCustomViewTable.css';
import { useNowMillisecondsForLiveCell } from './useNowMillisecondsForLiveCell';
import {
    applyCondition,
    buildColumns,
    buildDatasource,
    getQueriesFromIndicators,
    TTableRow,
} from './utils';

export type TCustomViewTableProps = {
    className?: string;
    statusStyle?: Properties;
    table: TCustomViewCompiledTableContent;
    owner: EApplicationOwner;
    url: TSocketURL;
    backtestingRunId?: TBacktestingRunId;
};

export const ConnectedCustomViewTable = memo(
    ({ className, statusStyle, table, owner, url, backtestingRunId }: TCustomViewTableProps) => {
        const { getServerTime$ } = useModule(ModuleSocketServerTime);

        const indicatorQueries = useMemo(
            () =>
                getQueriesFromIndicators(table.allIndicators).map((query) => ({
                    ...query,
                    backtestingRunId,
                })),
            [backtestingRunId, table.allIndicators],
        );

        const indicators = useLastIndicatorsMap(indicatorQueries) ?? EMPTY_MAP;

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

        const resultClassName = useMemo(
            () =>
                cn(
                    cnTable,
                    className,
                    isNil(tableParameters.style)
                        ? null
                        : cxs(styleTableLegacy(tableParameters.style)),
                    {
                        [cnDashboard]: owner === EApplicationOwner.Dashboard,
                        [cnTSM]: owner === EApplicationOwner.TSM,
                    },
                ),
            [className, tableParameters.style, owner],
        );

        const dataSource = useMemo(
            () => buildDatasource(functionCacheMap, table, indicators, serverNow, backtestingRunId),
            [functionCacheMap, table, indicators, serverNow, backtestingRunId],
        );

        const columns = useMemo(() => buildColumns(tableParameters), [tableParameters]);

        const showHeader = useMemo(() => columns.some(({ title }) => !isEmpty(title)), [columns]);

        const rowClassNameBuilder = useFunction(({ rowClassName }: TTableRow): string =>
            isEmpty(statusStyle) && !isEmpty(rowClassName) ? rowClassName! : '',
        );

        return (
            <Table
                size="small"
                tableLayout={tableParameters.layout}
                className={resultClassName}
                style={statusStyle}
                rowClassName={rowClassNameBuilder}
                showHeader={showHeader}
                columns={columns}
                dataSource={dataSource}
                pagination={false}
            />
        );
    },
);
