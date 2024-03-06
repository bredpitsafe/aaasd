import { ValueFormatterParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';

import { THerodotusTaskView } from '../../../types';
import { EHerodotusTaskType } from '../../../types/domain';
import { numberFormatterWithCurrency } from './numberFormatterWithCurrency';

export const volumeFormatter = (params: ValueFormatterParams<THerodotusTaskView>): string => {
    const task = params.data;
    if (isNil(task)) {
        return '—';
    }
    const { buyVolume, sellVolume, computationCurrency, isUSDComputationCurrency } = task;
    const formatterOptions: Intl.NumberFormatOptions = { maximumFractionDigits: 2 };

    switch (task.taskType) {
        case EHerodotusTaskType.Buy: {
            return numberFormatterWithCurrency(
                buyVolume,
                computationCurrency,
                isUSDComputationCurrency,
                formatterOptions,
            );
        }
        case EHerodotusTaskType.Sell: {
            return numberFormatterWithCurrency(
                sellVolume,
                computationCurrency,
                isUSDComputationCurrency,
                formatterOptions,
            );
        }
        case EHerodotusTaskType.BuySell: {
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
