import type { ValueFormatterParams } from '@frontend/ag-grid';
import { ESide } from '@frontend/common/src/types/domain/task';
import { isNil } from 'lodash-es';

import type { THerodotusTaskView } from '../../../types';
import { numberFormatterWithCurrency } from './numberFormatterWithCurrency';

export const volumeFormatter = (params: ValueFormatterParams<THerodotusTaskView>): string => {
    const task = params.data;
    if (isNil(task)) {
        return '—';
    }
    const { buyVolume, sellVolume, computationCurrency, isUSDComputationCurrency } = task;
    const formatterOptions: Intl.NumberFormatOptions = { maximumFractionDigits: 2 };

    switch (task.taskType) {
        case ESide.Buy: {
            return numberFormatterWithCurrency(
                buyVolume,
                computationCurrency,
                isUSDComputationCurrency,
                formatterOptions,
            );
        }
        case ESide.Sell: {
            return numberFormatterWithCurrency(
                sellVolume,
                computationCurrency,
                isUSDComputationCurrency,
                formatterOptions,
            );
        }
        case ESide.BuySell: {
            const sell = numberFormatterWithCurrency(
                sellVolume,
                computationCurrency,
                isUSDComputationCurrency,
                formatterOptions,
            );

            const buy = numberFormatterWithCurrency(
                buyVolume,
                computationCurrency,
                isUSDComputationCurrency,
                formatterOptions,
            );

            return `${sell} / ${buy}`;
        }
    }
};
