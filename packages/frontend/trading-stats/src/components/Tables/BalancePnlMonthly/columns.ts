import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { parseToDayjsInTimeZone } from '@common/utils';
import type { CellClassParams, ColDef } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { lowerCaseComparator } from '@frontend/ag-grid/src/comparators/lowerCaseComparator';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { usdFormatter } from '@frontend/common/src/components/AgTable/formatters/usd';
import { DefaultValueTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultValueTooltip';
import type { TAmountUSD } from '@frontend/common/src/types/domain/tradingStats.ts';
import { isEmpty, isNil } from 'lodash-es';
import { useMemo } from 'react';

import { tooltipFullUsdValueGetter } from '../ArbStatsMonthly/utils';
import { cnBold, cnColumnTotal } from '../style.css';
import { getHeatMapColor } from '../utils.ts';
import { PnlCellRenderer, pnlCellValueGetterFactory } from './renderers/PnlCellRenderer';
import { cnTableCell } from './style.css.ts';
import type { TBalancePnlMonthly } from './types';
import { calculateHeatmapTotals, EAggFuncs } from './utils.tsx';

export function useColumns(
    data: TBalancePnlMonthly[] | undefined,
    dates: string[],
    timeZone: TimeZone,
): ColDef<TBalancePnlMonthly>[] {
    const totals = useMemo(() => calculateHeatmapTotals(data), [data]);

    return useMemo(() => {
        const baseColumns: ColDef<TBalancePnlMonthly>[] = [
            {
                field: 'name',
                sort: 'asc',
                comparator: lowerCaseComparator,
                valueFormatter: ({ data, node }) => {
                    const name = data?.name;

                    if (node?.footer ?? false) {
                        return 'Total';
                    }

                    return isNil(name) || isEmpty(name) ? 'No Strategy' : name;
                },
                cellClass: cnBold,
                filter: EColumnFilterType.set,
            },
            {
                colId: 'total-profit',
                headerName: 'Total',
                equals: AgValue.isEqual,
                valueGetter: pnlCellValueGetterFactory((data) => data.profit),
                valueFormatter: usdFormatter(true),
                cellRenderer: PnlCellRenderer,
                cellClass: [cnBold, cnColumnTotal, cnTableCell],
                cellStyle: ({
                    value,
                }: CellClassParams<TBalancePnlMonthly, AgValue<TAmountUSD, {}>>) => ({
                    backgroundColor: getHeatMapColor(Math.abs(value?.payload ?? 0), 0, totals),
                }),
                filter: EColumnFilterType.number,
                minWidth: 80,
                tooltipValueGetter: tooltipFullUsdValueGetter,
                tooltipComponent: DefaultValueTooltip,
                aggFunc: EAggFuncs.SumExceptEmpty,
            },
        ];
        const dateColumns: ColDef<TBalancePnlMonthly>[] = dates.map((date) => {
            const headerName = parseToDayjsInTimeZone(date, timeZone, EDateTimeFormats.Date).format(
                EDateTimeFormats.MonthDay,
            );

            return {
                colId: date,
                headerName,
                equals: AgValue.isEqual,
                valueGetter: pnlCellValueGetterFactory((data) => data.profits[date]?.profit),
                valueFormatter: usdFormatter(true),
                cellRenderer: PnlCellRenderer,
                cellClass: [cnTableCell],
                cellStyle: ({
                    value,
                }: CellClassParams<TBalancePnlMonthly, AgValue<TAmountUSD, {}>>) => ({
                    backgroundColor: getHeatMapColor(Math.abs(value?.payload ?? 0), 0, totals),
                }),
                filter: EColumnFilterType.number,
                minWidth: 80,
                tooltipValueGetter: tooltipFullUsdValueGetter,
                tooltipComponent: DefaultValueTooltip,
                aggFunc: EAggFuncs.SumExceptEmpty,
            };
        });

        return baseColumns.concat(dateColumns);
    }, [dates, timeZone, totals]);
}
