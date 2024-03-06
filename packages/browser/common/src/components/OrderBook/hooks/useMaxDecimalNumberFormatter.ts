import { isNil } from 'lodash-es';
import memoizee from 'memoizee';
import { useMemo } from 'react';

import { number2DisplayNumber } from '../utils';

const DEFAULT_FORMATTER = '%.10g';
const FRACTION_DIGITS_SEPARATOR = '.';

export function useMaxDecimalNumberFormatter(
    value: undefined | number,
    numbers: number[],
    formatter = DEFAULT_FORMATTER,
): undefined | { display: string; postfix?: string } {
    return useMemo(() => {
        if (isNil(value)) {
            return undefined;
        }

        const display = number2DisplayNumber(value, formatter);
        const currentFractionDigits = getFractionDigits(display);
        const padDigits = getMaxFractionDigits(numbers, formatter) - currentFractionDigits;

        if (padDigits === 0) {
            return { display };
        }

        const padString = '0'.repeat(padDigits);

        const postfix = display.includes(FRACTION_DIGITS_SEPARATOR)
            ? padString
            : `${FRACTION_DIGITS_SEPARATOR}${padString}`;

        return { display, postfix };
    }, [value, numbers, formatter]);
}

function getFractionDigits(displayNumber: string): number {
    const fractionSeparator = displayNumber.indexOf(FRACTION_DIGITS_SEPARATOR);

    if (fractionSeparator < 0) {
        return 0;
    }

    return displayNumber.length - fractionSeparator - 1;
}

const getMaxFractionDigits = memoizee(
    (numbers: number[], formatter: string): number =>
        Math.max(
            ...numbers.map((number) => getFractionDigits(number2DisplayNumber(number, formatter))),
        ),
    {
        primitive: true,
        max: 5,
    },
);
