import { formatNumber, formatUsd } from '@frontend/common/src/utils/formatNumber/formatNumber';
import { isNil } from 'lodash-es';

export const numberFormatterWithCurrency = (
    value: number | null,
    computationCurrency: string | undefined,
    isUSDComputationCurrency: boolean | undefined,
    formatOptions: Intl.NumberFormatOptions = { maximumFractionDigits: 6 },
) => {
    if (
        isNil(value) ||
        isNil(computationCurrency) ||
        isNil(isUSDComputationCurrency) ||
        isNaN(value)
    ) {
        return '—';
    }

    const strValue = isUSDComputationCurrency
        ? formatUsd(value, formatOptions)
        : formatNumber(value, formatOptions);
    return isUSDComputationCurrency ? strValue : `${strValue} ${computationCurrency}`;
};
