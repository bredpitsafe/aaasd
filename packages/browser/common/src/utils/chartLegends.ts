import { isNil, isNull, isNumber, isUndefined } from 'lodash-es';

import { EChartLabelFormats } from '../types/panels';
import { sprintf } from './sprintf/sprintf';

const NUMBER_FORMAT_REGEXP = /%((?:\([^)]+\))|(?:\d+\$))?[\d.]*[bcdieufgotTvxXjMC]/g;

export function getChartLegendLabel(
    labelFormat: string | undefined,
    label: string,
    value: number | null | undefined,
    options?: {
        nullValue?: string;
        undefinedValue?: string;
    },
): string {
    const format = labelFormat || EChartLabelFormats.default;
    const indicatorValue = createIndicatorValue(value, options);

    try {
        return sprintf(createSuitableFormat(format, indicatorValue), label, indicatorValue);
    } catch (e) {}

    return `${label}: ${indicatorValue}`;
}

export function getCellText(
    text?: string,
    value?: number | null,
    options?: {
        nullValue?: string;
        undefinedValue?: string;
    },
): string {
    const indicatorValue = createIndicatorValue(value, options);

    if (isNil(text)) {
        return indicatorValue.toString();
    }

    try {
        if (!text.includes('%')) {
            return text;
        }

        return sprintf(createSuitableFormat(text, indicatorValue), indicatorValue);
    } catch (e) {
        throw new Error(`Can't apply format: "${text ?? EChartLabelFormats.default}"`);
    }
}

function createIndicatorValue(
    value?: number | null,
    options?: {
        nullValue?: string;
        undefinedValue?: string;
    },
): number | string {
    if (isUndefined(value)) {
        return options?.undefinedValue ?? '[]';
    }

    if (isNull(value) || isNaN(value)) {
        return options?.nullValue ?? '—';
    }

    return value;
}

function createSuitableFormat(labelFormat: string, indicatorValue: number | string): string {
    if (isNumber(indicatorValue)) {
        return labelFormat;
    }

    // Try to reuse existing format which expects number indicator value
    // Could be extended to support paddings of sprintf format
    return labelFormat.replace(NUMBER_FORMAT_REGEXP, '%$1s');
}
