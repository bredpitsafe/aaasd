import { memoize } from 'lodash-es';

const INTL_FORMAT_USD: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
};

const INTL_FORMAT_USD_COMPACT: Intl.NumberFormatOptions = {
    ...INTL_FORMAT_USD,
    notation: 'compact',
};

const getIntlNumberFormat = memoize(
    (format: Intl.NumberFormatOptions) => new Intl.NumberFormat('en-US', format),
);

export function formatNumber(
    value: number | null | undefined,
    format: Intl.NumberFormatOptions,
): string {
    if (value === undefined || value === null) {
        return '—';
    }

    const formatter = getIntlNumberFormat(format);
    const formattedValue = formatter.format(value);

    // Thousands sign should be `k`, not `K`
    if (format?.notation === 'compact') {
        const absValue = Math.abs(value);
        if (absValue >= 10e2 && absValue < 10e5) {
            return formattedValue.replace('K', 'k');
        }
    }

    return formattedValue;
}

/* Format full USD values as following:
 * $0.00 - $999.99
 * $1,000.0 - $9,999.9
 * $10,000 - $999,999,999 */
export function formatUsd(value?: number | null, formatOptions?: Intl.NumberFormatOptions): string {
    return formatNumber(value, getFractionsFormat(value, { ...INTL_FORMAT_USD, ...formatOptions }));
}

/* Format compact USD values as following:
 * $0.00 - $999.99
 * $1,000.0 - $9,999.9
 * $10.00k - $999,99k
 * $1.00M - $999.99M
 * $1.00B - $999.99B */
export function formatUsdCompact(value?: number | null): string {
    // Do not use `compact` formatting for numbers |0...9999|
    const format = getFractionsFormat(
        value,
        shouldApplySpecialFormattingFor1kTo10k(value) ? INTL_FORMAT_USD : INTL_FORMAT_USD_COMPACT,
    );

    return formatNumber(value, format);
}

function shouldApplySpecialFormattingFor1kTo10k(value: number | null | undefined): boolean {
    if (!value) {
        return false;
    }

    const absValue = Math.abs(value);
    return absValue >= 10e2 && absValue < 10e3;
}

function getFractionsFormat(
    value: number | null | undefined,
    format: Intl.NumberFormatOptions,
): Intl.NumberFormatOptions {
    if (!value) {
        return format;
    }

    if (shouldApplySpecialFormattingFor1kTo10k(value)) {
        return {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
            ...format,
        };
    }

    return {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...format,
    };
}
