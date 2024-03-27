import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import type { AgCartesianChartOptions } from 'ag-charts-community/dist/esm/es6/chart/agChartOptions';
import { escape, isNil } from 'lodash-es';
import { useMemo } from 'react';

import { SERIES_OPTIONS } from '../utils';
import { cnOverlay } from '../view.css';
import type { TPlainExchangeStatsDescriptor } from './usePlainExchangeStats';

export function useChartOptions(
    coin: TCoinId | undefined,
    plainExchangeStatsDescriptor: TPlainExchangeStatsDescriptor,
): AgCartesianChartOptions {
    return useMemo(
        () => ({
            type: 'column' as AgCartesianChartOptions['type'],
            data: isSyncDesc(plainExchangeStatsDescriptor)
                ? plainExchangeStatsDescriptor.value
                : [],
            series: SERIES_OPTIONS,
            overlays: {
                noData: {
                    renderer: () =>
                        `<div class="${cnOverlay}">${escape(
                            getMessage(coin, plainExchangeStatsDescriptor),
                        )}</div>`,
                },
            },
        }),
        [coin, plainExchangeStatsDescriptor],
    );
}

function getMessage(
    coin: TCoinId | undefined,
    plainExchangeStatsDescriptor: TPlainExchangeStatsDescriptor,
) {
    if (isNil(coin)) {
        return 'Coin not selected';
    }

    if (isSyncDesc(plainExchangeStatsDescriptor)) {
        return `No exchanges for ${coin}`;
    }

    if (isFailDesc(plainExchangeStatsDescriptor)) {
        return 'Failed to load data';
    }

    return 'Loading data';
}
