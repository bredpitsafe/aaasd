import type { TimeZone } from '@common/types';
import type { ValueFormatterParams, ValueGetterParams } from '@frontend/ag-grid';
import type { TColDef } from '@frontend/ag-grid/src/types';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import type { TAmount } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TPumpDumpInfo } from '../../../../modules/actions/ModuleSubscribeToCurrentPumpDumpInfo.ts';
import { getPercentOrEmpty } from '../../../utils';
import { CoinCellRenderer } from '../../components/CoinCellRenderer';
import { cnCenterCellContent } from '../../style.css';
import {
    createRowIndexColumn,
    FLOATING_DATE_FILTER,
    FLOATING_NUMBER_FILTER,
    FLOATING_SET_FILTER,
    FLOATING_TEXT_FILTER,
    formatAmountOrEmptyWithoutGroups,
    getIsoDateFilterParams,
} from '../../utils';
import { DirectionCellRenderer } from '../components/DirectionCellRenderer';
import { RateChangeCellRenderer } from '../components/RateChangeCellRenderer';
import { RATE_AMOUNT_DIGITS } from '../defs';
import { directionNumber2Display, interval2text } from '../utils';

export function useColumns(timeZone: TimeZone): TColDef<TPumpDumpInfo>[] {
    return useMemo(
        () => [
            createRowIndexColumn(),

            {
                field: 'coin',
                headerName: 'Coin',
                cellRenderer: CoinCellRenderer,
                sort: 'asc',

                ...FLOATING_SET_FILTER,
            },

            {
                colId: 'rateChange',
                headerName: 'Rate Change',
                cellRenderer: RateChangeCellRenderer,
                valueGetter: ({ data }: ValueGetterParams<TPumpDumpInfo>): number | undefined =>
                    isNil(data)
                        ? undefined
                        : getPercentOrEmpty(
                              data.endRate.rate - data.startRate.rate,
                              data.startRate.rate,
                          ),
                comparator: (valueA, valueB) => {
                    const absValueA = Math.abs(valueA);
                    const absValueB = Math.abs(valueB);

                    return absValueA == absValueB ? 0 : absValueA - absValueB;
                },
                ...FLOATING_NUMBER_FILTER,
            },
            {
                colId: 'changeDirection',
                headerName: 'Change Direction',
                cellRenderer: DirectionCellRenderer,
                valueGetter: ({
                    data,
                }: ValueGetterParams<TPumpDumpInfo>): ReturnType<
                    typeof directionNumber2Display
                > => {
                    const direction = isNil(data)
                        ? undefined
                        : Math.sign(data.endRate.rate - data.startRate.rate);

                    return isNil(direction) || direction === 0
                        ? null
                        : directionNumber2Display(direction);
                },
                cellClass: () => cnCenterCellContent,
                initialHide: true,

                ...FLOATING_SET_FILTER,
            },

            {
                field: 'startRate.rate',
                headerName: 'Start Rate',
                initialHide: true,
                valueFormatter: ({ value }: ValueFormatterParams<TPumpDumpInfo, TAmount>) =>
                    formatAmountOrEmptyWithoutGroups(value, RATE_AMOUNT_DIGITS),
                ...FLOATING_TEXT_FILTER,
            },

            {
                ...getTimeColumn<TPumpDumpInfo>(
                    'startRate.timestamp',
                    'Start Rate TimeStamp',
                    timeZone,
                ),
                minWidth: 170,
                initialHide: true,
                ...FLOATING_DATE_FILTER,
                filterParams: getIsoDateFilterParams(timeZone),
            },

            {
                field: 'endRate.rate',
                headerName: 'End Rate',
                initialHide: true,
                valueFormatter: ({ value }: ValueFormatterParams<TPumpDumpInfo, TAmount>) =>
                    formatAmountOrEmptyWithoutGroups(value, RATE_AMOUNT_DIGITS),
                ...FLOATING_TEXT_FILTER,
            },

            {
                ...getTimeColumn<TPumpDumpInfo>(
                    'endRate.timestamp',
                    'End Rate TimeStamp',
                    timeZone,
                ),
                minWidth: 170,
                initialHide: true,
                ...FLOATING_DATE_FILTER,
                filterParams: getIsoDateFilterParams(timeZone),
            },

            {
                field: 'timeInterval',
                headerName: 'Time Interval',
                valueGetter: ({ data }: ValueGetterParams<TPumpDumpInfo>) => {
                    if (isNil(data)) {
                        return '';
                    }

                    return interval2text(data.timeInterval);
                },

                ...FLOATING_SET_FILTER,
            },
        ],
        [timeZone],
    );
}
