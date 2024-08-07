import type { DefaultOptionType } from '@frontend/common/src/components/Select';
import type {
    TAmount,
    TBlockchainNetworkId,
    TCoinConvertRate,
    TRuleAccounts,
    TRuleCoins,
    TRuleExchanges,
    TTransfer,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { tryTransformToSymbol } from '@frontend/common/src/utils/domain/currency';
import BigDecimal from 'js-big-decimal';
import { isEqual, isNil, isString, uniqWith } from 'lodash-es';

export function formatAmountOrEmpty(value: TAmount | null | undefined, digits?: number): string {
    if (isNil(value)) {
        return '—';
    }

    return formatNumberWithGroups(value, digits);
}

const BIG_DECIMAL_VALUE_100 = new BigDecimal(100);

export function getPercentOrEmpty(
    value: number | undefined,
    total: number | undefined,
    truncDigits?: number,
): number | undefined {
    if (isNil(value) || isNil(total) || total === 0) {
        return undefined;
    }

    const bigDecimal = new BigDecimal(value)
        .multiply(BIG_DECIMAL_VALUE_100)
        .divide(new BigDecimal(total));

    return parseFloat(
        (isNil(truncDigits)
            ? bigDecimal
            : bigDecimal.round(truncDigits, BigDecimal.RoundingModes.FLOOR)
        ).getValue(),
    );
}

export function getPercentageValue(
    value: number,
    percentage: number,
    truncDigits?: number,
): number {
    const bigDecimal = new BigDecimal(value)
        .multiply(new BigDecimal(percentage))
        .divide(BIG_DECIMAL_VALUE_100);

    return parseFloat(
        (isNil(truncDigits)
            ? bigDecimal
            : bigDecimal.round(truncDigits, BigDecimal.RoundingModes.FLOOR)
        ).getValue(),
    );
}

export function formattedPercentOrEmpty(value: number | undefined, digits?: number): string {
    if (isNil(value)) {
        return '—';
    }

    return `${formatNumberWithGroups(value, digits)}%`;
}

function formatNumberWithGroups(value: number, digits?: number): string {
    const bigDecimal = new BigDecimal(value);

    return (
        isNil(digits) ? bigDecimal : bigDecimal.round(digits, BigDecimal.RoundingModes.FLOOR)
    ).getPrettyValue();
}

export const DEFAULT_FILTER_OPTION = (input: string, option?: DefaultOptionType): boolean => {
    if (isNil(option)) {
        return false;
    }

    const optionValue = isString(option.label)
        ? option.label
        : isNil(option.value)
          ? ''
          : option.value.toString();

    return optionValue.toLowerCase().includes(input.toLowerCase()) ?? false;
};

export function roundAmount(amount: TAmount, digits: number): TAmount {
    return parseFloat(
        new BigDecimal(amount).round(digits, BigDecimal.RoundingModes.FLOOR).getValue(),
    ) as TAmount;
}

export function formatAmountOrEmptyWithConversionRate(
    amount: TAmount | undefined,
    convertRate: TCoinConvertRate | undefined,
    decimals?: number,
    conversionDecimals?: number,
): string {
    const amountDisplay = formatAmountOrEmpty(amount, decimals);
    const quoteAmountDisplay = formatQuoteAmount(amount, convertRate, conversionDecimals);

    if (isNil(quoteAmountDisplay)) {
        return amountDisplay;
    }

    return `${amountDisplay} (${quoteAmountDisplay})`;
}

export function formatQuoteAmount(
    amount: TAmount | undefined,
    convertRate: TCoinConvertRate | undefined,
    decimals?: number,
): string | undefined {
    if (isNil(convertRate) || isNil(amount) || amount === 0) {
        return undefined;
    }

    const quoteAmount = getQuoteAmount(amount, convertRate, decimals);

    return `${tryTransformToSymbol(convertRate.quote)}${formatAmountOrEmpty(
        quoteAmount,
        decimals,
    )}`;
}

export function getQuoteAmount(
    amount: TAmount,
    convertRate: TCoinConvertRate,
    decimals?: number,
): TAmount {
    const quoteAmount = new BigDecimal(amount).multiply(new BigDecimal(convertRate.rate));

    return parseFloat(
        (isNil(decimals)
            ? quoteAmount
            : quoteAmount.round(decimals, BigDecimal.RoundingModes.FLOOR)
        ).getValue(),
    ) as TAmount;
}

export function formatBaseAmount(
    amount: TAmount | undefined,
    convertRate: TCoinConvertRate | undefined,
    decimals?: number,
): string | undefined {
    if (isNil(convertRate) || isNil(amount) || amount === 0) {
        return undefined;
    }

    const baseAmount = getBaseAmount(amount, convertRate, decimals);

    return `${formatAmountOrEmpty(baseAmount, decimals)} ${tryTransformToSymbol(convertRate.base)}`;
}

function getBaseAmount(amount: TAmount, convertRate: TCoinConvertRate, decimals?: number): TAmount {
    const baseAmount = new BigDecimal(amount).divide(new BigDecimal(convertRate.rate));

    return parseFloat(
        (isNil(decimals)
            ? baseAmount
            : baseAmount.round(decimals, BigDecimal.RoundingModes.FLOOR)
        ).getValue(),
    ) as TAmount;
}

export function isEqualsComplexRuleValues<T extends TRuleCoins | TRuleExchanges | TRuleAccounts>(
    left: T | undefined,
    right: T | undefined,
) {
    const isLeftArray = Array.isArray(left);
    const isRightArray = Array.isArray(right);

    if (isLeftArray && isRightArray) {
        return isEqual(left.slice().sort(), right.slice().sort());
    }

    if (!isLeftArray && !isRightArray) {
        return left === right;
    }

    return false;
}

export function getNetworksFromTransfers(
    transfers: TTransfer[],
): { network: TBlockchainNetworkId; networkPriority: number }[] {
    return uniqWith(
        transfers?.map(({ network, networkPriority }) => ({
            network,
            networkPriority,
        })),
        isEqual,
    );
}
