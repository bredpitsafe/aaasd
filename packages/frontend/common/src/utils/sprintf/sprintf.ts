import type { sprintf as origSprintf } from 'sprintf-js';
import { vsprintf } from 'sprintf-js';

import { formatNumber } from '../formatNumber/formatNumber';

const SPRINTF_FORMAT_REGEXP = /%(\([^)]+\))|%(\d+\$)?([\d.]*)([sbcdieufgotTvxXjMC])/g;
const MONEY_FORMAT_REGEXP = /%(\([^)]+\))|%(\d+\$)?([\d.]*)([MC])/g;

/* Modified `sprintf` function.
 * Additional features compared to original implementation:
 * 1. Support %M and %C formats with Intl.NumberFormat.
 * 2. Fix bug that renders `NaN` as `-NaN`.
 * 3. Fix bug that renders negative zero values, e.g. `-0.00`. */
export const sprintf: typeof origSprintf = (format, ...args) => {
    const matches = format.matchAll(SPRINTF_FORMAT_REGEXP);

    Array.from(matches).forEach((match, matchIndex) => {
        const [, , , params, mode] = match;
        switch (mode) {
            case 'M':
            case 'C': {
                const [width, precision] = params.split('.');

                const numFormat: Intl.NumberFormatOptions = {
                    notation: mode === 'C' ? 'compact' : 'standard',
                    minimumFractionDigits: !isNaN(Number(precision)) ? Number(precision) : 2,
                    maximumFractionDigits: !isNaN(Number(precision)) ? Number(precision) : 2,
                };

                if (Number(width)) {
                    numFormat.minimumIntegerDigits = Number(width);
                }
                // We intentionally modify args array. It's safe since it's not used anywhere else
                args[matchIndex] = formatNumber(args[matchIndex], numFormat);
            }
        }
    });

    const newFormat = format.replaceAll(MONEY_FORMAT_REGEXP, '%$1$2s');
    return vsprintf(newFormat, args)
        .replace('-NaN', 'NaN')
        .replace(/^-([0.]+)$/, '$1');
};
