import { lowerCaseComparator } from '@frontend/common/src/components/AgTable/comparators/lowerCaseComparator';
import { usdFormatter } from '@frontend/common/src/components/AgTable/formatters/usd';
import { DefaultValueTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultValueTooltip';
import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
import { EDateTimeFormats, TimeZone } from '@frontend/common/src/types/time';
import { parseToDayjsInTimeZone } from '@frontend/common/src/utils/time';
import { ColDef } from 'ag-grid-community';
import { useMemo } from 'react';

import { tooltipFullUsdValueGetter } from '../ArbStatsMonthly/utils';
import { cnBold } from '../style.css';
import { PnlCellRenderer } from './renderers/PnlCellRenderer';
import { TBalancePnlMonthly } from './types';

export function useColumns(dates: string[], timeZone: TimeZone): ColDef<TBalancePnlMonthly>[] {
    return useMemo(() => {
        const baseColumns: ColDef<TBalancePnlMonthly>[] = [
            {
                field: 'name',
                sort: 'asc',
                comparator: lowerCaseComparator,
                valueFormatter: (params) => params.data?.name || 'No Strategy',
                cellClass: cnBold,
                filter: EColumnFilterType.set,
            },
            {
                field: 'profit',
                valueFormatter: usdFormatter(true),
                cellRenderer: PnlCellRenderer,
                cellClass: cnBold,
                filter: EColumnFilterType.number,
                minWidth: 80,
                tooltipValueGetter: tooltipFullUsdValueGetter,
                tooltipComponent: DefaultValueTooltip,
            },
        ];
        const dateColumns: ColDef<TBalancePnlMonthly>[] = dates.map((date) => {
            const headerName = parseToDayjsInTimeZone(date, timeZone, EDateTimeFormats.Date).format(
                EDateTimeFormats.MonthDay,
            );

            return {
                colId: date,
                headerName,
                valueGetter: (params) => params.data?.profits[date]?.profit,
                valueFormatter: usdFormatter(true),
                cellRenderer: PnlCellRenderer,
                filter: EColumnFilterType.number,
                minWidth: 80,
                tooltipValueGetter: tooltipFullUsdValueGetter,
                tooltipComponent: DefaultValueTooltip,
            };
        });

        return baseColumns.concat(dateColumns);
    }, [dates, timeZone]);
}
