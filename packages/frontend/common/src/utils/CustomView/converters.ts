import type { Milliseconds } from '@common/types';
import { iso2milliseconds } from '@common/utils';
import type { Properties } from 'csstype';
import { isNil, isUndefined } from 'lodash-es';

import type { TIndicator } from '../../modules/actions/indicators/defs';
import type { TConverterValue, TScheme } from './defs';

export function convertIndicatorByScheme(
    indicatorValue: TIndicator['value'] | undefined,
    updateTime: TIndicator['updateTime'] | undefined,
    now: Milliseconds,
    scheme: Omit<TScheme, 'name'>,
): TConverterValue | undefined {
    if (scheme.timeout) {
        if (isNil(updateTime)) {
            return {
                style: scheme.timeoutStyle as Properties,
            };
        }

        const indicatorTime = iso2milliseconds(updateTime);

        if (now - indicatorTime >= scheme.timeout) {
            return {
                style: scheme.timeoutStyle as Properties,
            };
        }
    }

    if (!Array.isArray(scheme.config) || scheme.config.length === 0) {
        return undefined;
    }

    for (const element of scheme.config) {
        const { value, left, right } = element;

        const hasValue = !isUndefined(value);
        const hasLeftRange = !isUndefined(left);
        const hasRightRange = !isUndefined(right);
        const hasRange = hasLeftRange || hasRightRange;

        if (hasValue) {
            if (value === indicatorValue) {
                return {
                    text: element.text,
                    tooltip: element.tooltip,
                    style: element.style,
                };
            }

            continue;
        }

        if (hasRange) {
            if (
                !isNil(indicatorValue) &&
                (!hasLeftRange || indicatorValue >= left) &&
                (!hasRightRange || indicatorValue <= right)
            ) {
                return {
                    text: element.text,
                    tooltip: element.tooltip,
                    style: element.style,
                };
            }

            continue;
        }

        return {
            text: element.text,
            tooltip: element.tooltip,
            style: element.style,
        };
    }
}
