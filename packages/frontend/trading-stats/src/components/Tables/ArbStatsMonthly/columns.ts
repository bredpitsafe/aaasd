import { ColDef, ValueFormatterFunc } from '@frontend/ag-grid';
import { lowerCaseComparator } from '@frontend/ag-grid/src/comparators/lowerCaseComparator';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { emptyFormatter } from '@frontend/common/src/components/AgTable/formatters/empty';
import { DefaultValueTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultValueTooltip';
import { EDateTimeFormats, TimeZone } from '@frontend/common/src/types/time';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { formatUsdCompact } from '@frontend/common/src/utils/formatNumber/formatNumber';
import { parseToDayjsInTimeZone } from '@frontend/common/src/utils/time';
import { useMemo } from 'react';

import { EArbStatsBreakdownType } from '../ArbStatsDaily/types';
import { cnBold } from '../style.css';
import { noPaddingStyler } from './cellStylers/noPaddingStyler';
import {
    calculateHeatmapBreakdown,
    calculateHeatmapStrategyByDate,
    calculateHeatmapTotals,
    calculateHeatmapTotalsBreakdown,
} from './heatmap';
import { ArbCellRenderer } from './renderers/ArbCellRenderer';
import { TArbMonthlyStrategy, TArbMonthlyValue } from './types';
import { EAggFuncs, tooltipFullUsdValueGetter } from './utils';
import { cnColumnTotal } from './view.css';

type TUseColumnsParams = {
    dates: string[];
    data?: TArbMonthlyStrategy[];
    timeZone: TimeZone;
};

export const autoGroupColumnDef = {
    headerName: 'Strategy',
    minWidth: 220,
    cellRendererParams: {
        suppressCount: true,
    },
};

const valueFormatter: ValueFormatterFunc<TArbMonthlyStrategy> = emptyFormatter(
    (value: TArbMonthlyValue | undefined) => formatUsdCompact(value),
);

export function useColumns(params: TUseColumnsParams): ColDef<TArbMonthlyStrategy>[] {
    const { dates, data, timeZone } = params;

    const list = data ?? EMPTY_ARRAY;
    const heatmapTotals = useMemo(() => calculateHeatmapTotals(list), [list]);
    const heatmapTotalsBreakdownAssetWise = useMemo(
        () => calculateHeatmapTotalsBreakdown(list, EArbStatsBreakdownType.AssetWise),
        [list],
    );
    const heatmapTotalsBreakdownExchangeWise = useMemo(
        () => calculateHeatmapTotalsBreakdown(list, EArbStatsBreakdownType.ExchangeWise),
        [list],
    );
    const heatmapStrategyByDate = useMemo(() => calculateHeatmapStrategyByDate(list), [list]);
    const heatmapBreakdownAssetWise = useMemo(
        () => calculateHeatmapBreakdown(list, EArbStatsBreakdownType.AssetWise),
        [list],
    );
    const heatmapBreakdownExchangeWise = useMemo(
        () => calculateHeatmapBreakdown(list, EArbStatsBreakdownType.ExchangeWise),
        [list],
    );

    return useMemo(() => {
        const baseColumns: ColDef<TArbMonthlyStrategy>[] = [
            {
                field: 'strategy',
                sort: 'asc',
                comparator: lowerCaseComparator,
                cellClass: cnBold,
                filter: EColumnFilterType.set,
                rowGroup: true,
                rowGroupIndex: 0,
                hide: true,
                valueFormatter: (params) => params.value || 'No Strategy',
            },
            {
                field: 'breakdown',
                rowGroup: true,
                rowGroupIndex: 1,
                hide: true,
                valueGetter: (params) => {
                    switch (params.data?.breakdown) {
                        case EArbStatsBreakdownType.AssetWise: {
                            return 'Base-wise Breakdown';
                        }
                        case EArbStatsBreakdownType.ExchangeWise: {
                            return 'Exchange-wise Breakdown';
                        }
                    }
                },
            },
            {
                field: 'name',
                comparator: lowerCaseComparator,
                filter: EColumnFilterType.set,
            },
        ];

        if (dates.length > 0) {
            baseColumns.push({
                field: 'total',
                headerName: 'Total',
                cellClass: [cnBold, cnColumnTotal],
                cellStyle: noPaddingStyler,
                cellRenderer: ArbCellRenderer,
                cellRendererParams: heatmapTotals,
                cellRendererSelector: (params) => {
                    return {
                        params:
                            params.node.level === 0
                                ? heatmapTotals
                                : params.data?.breakdown === EArbStatsBreakdownType.ExchangeWise
                                  ? heatmapTotalsBreakdownExchangeWise
                                  : heatmapTotalsBreakdownAssetWise,
                        component: ArbCellRenderer,
                    };
                },
                filter: EColumnFilterType.number,
                aggFunc: EAggFuncs.SumExceptFirstLevel,
                valueFormatter,
                minWidth: 80,
                tooltipValueGetter: tooltipFullUsdValueGetter,
                tooltipComponent: DefaultValueTooltip,
            });
        }

        const dateColumns: ColDef<TArbMonthlyStrategy>[] = dates.map((date) => {
            const headerName = parseToDayjsInTimeZone(date, timeZone, EDateTimeFormats.Date).format(
                EDateTimeFormats.MonthDay,
            );

            return {
                colId: date,
                headerName,
                valueGetter: (params) => params.data?.values[date],
                cellRendererSelector: (params) => {
                    return {
                        params:
                            params.node.level === 0
                                ? heatmapStrategyByDate
                                : params.data?.breakdown === EArbStatsBreakdownType.ExchangeWise
                                  ? heatmapBreakdownExchangeWise
                                  : heatmapBreakdownAssetWise,
                        component: ArbCellRenderer,
                    };
                },
                cellStyle: noPaddingStyler,
                filter: EColumnFilterType.number,
                aggFunc: EAggFuncs.SumExceptFirstLevel,
                valueFormatter,
                minWidth: 80,
                tooltipValueGetter: tooltipFullUsdValueGetter,
                tooltipComponent: DefaultValueTooltip,
            };
        });

        return baseColumns.concat(dateColumns);
    }, [
        dates,
        heatmapBreakdownAssetWise,
        heatmapBreakdownExchangeWise,
        heatmapStrategyByDate,
        heatmapTotals,
        heatmapTotalsBreakdownAssetWise,
        heatmapTotalsBreakdownExchangeWise,
        timeZone,
    ]);
}
