import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { AgCartesianChartOptions } from 'ag-charts-community/dist/esm/es6/chart/agChartOptions';
import { escape, isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TPlainExchangeStats } from '../defs.ts';
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
            data: isSyncedValueDescriptor(plainExchangeStatsDescriptor)
                ? plainExchangeStatsDescriptor.value ?? (EMPTY_ARRAY as TPlainExchangeStats[])
                : (EMPTY_ARRAY as TPlainExchangeStats[]),
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

    if (isSyncedValueDescriptor(plainExchangeStatsDescriptor)) {
        return `No exchanges for ${coin}`;
    }

    if (isFailValueDescriptor(plainExchangeStatsDescriptor)) {
        return 'Failed to load data';
    }

    return 'Loading data';
}
