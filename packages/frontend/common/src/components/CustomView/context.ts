import type { Milliseconds, Seconds } from '@common/types';
import { getNowMilliseconds, iso2milliseconds, milliseconds2seconds, minus } from '@common/utils';
import { isNil } from 'lodash-es';

import type { TIndicator, TIndicatorKey } from '../../modules/actions/indicators/defs';
import type { TIndicatorsMap } from './utils';

function age(
    serverNow: undefined | Milliseconds,
    indicator: undefined | TIndicator,
    type: 'seconds' = 'seconds',
): Seconds | undefined {
    switch (type) {
        case 'seconds':
            if (isNil(indicator) || isNil(indicator.updateTime)) {
                return undefined;
            }

            return Math.trunc(
                milliseconds2seconds(
                    Math.max(
                        minus(
                            serverNow ?? getNowMilliseconds(),
                            iso2milliseconds(indicator.updateTime),
                        ),
                        0,
                    ) as Milliseconds,
                ),
            ) as Seconds;
        default:
            throw new Error(`ERROR: Age type "${type}" is unknown`);
    }
}

function less(indicatorLeft?: TIndicator, indicatorRight?: TIndicator): boolean {
    const leftValue = indicatorLeft?.valueOf();
    const rightValue = indicatorRight?.valueOf();

    if (isNil(leftValue) || isNil(rightValue)) {
        return false;
    }

    return leftValue < rightValue;
}

function greater(indicatorLeft?: TIndicator, indicatorRight?: TIndicator): boolean {
    const leftValue = indicatorLeft?.valueOf();
    const rightValue = indicatorRight?.valueOf();

    if (isNil(leftValue) || isNil(rightValue)) {
        return false;
    }

    return leftValue > rightValue;
}

function lessOrEqual(indicatorLeft?: TIndicator, indicatorRight?: TIndicator): boolean {
    const leftValue = indicatorLeft?.valueOf();
    const rightValue = indicatorRight?.valueOf();

    return less(indicatorLeft, indicatorRight) || leftValue === rightValue;
}

function greaterOrEqual(indicatorLeft?: TIndicator, indicatorRight?: TIndicator): boolean {
    const leftValue = indicatorLeft?.valueOf();
    const rightValue = indicatorRight?.valueOf();

    return greater(indicatorLeft, indicatorRight) || leftValue === rightValue;
}

function equal(indicatorLeft?: TIndicator, indicatorRight?: TIndicator): boolean {
    const leftValue = indicatorLeft?.valueOf();
    const rightValue = indicatorRight?.valueOf();

    return leftValue === rightValue;
}

function and(...conditions: boolean[]): boolean {
    return conditions?.every((condition) => condition) ?? false;
}

function or(...conditions: boolean[]): boolean {
    return conditions?.some((condition) => condition) ?? false;
}

function getIndicatorValue(indicators: TIndicatorsMap, name: TIndicatorKey) {
    const indicator = indicators.get(name);

    if (indicator === undefined) {
        return null;
    }

    return {
        updateTime: indicator.updateTime,
        value: indicator.value,
        valueOf: () => indicator.value,
    };
}

export const ContextArgumentNames = [
    'age',
    'equal',
    'less',
    'lessOrEqual',
    'greater',
    'greaterOrEqual',
    'eq',
    'lt',
    'lte',
    'gt',
    'gte',
    'and',
    'or',
    'getIndicatorValue',
];

export function getContextArgumentValues(serverNow: Milliseconds): Function[] {
    return [
        age.bind(undefined, serverNow),
        equal,
        less,
        lessOrEqual,
        greater,
        greaterOrEqual,
        equal,
        less,
        lessOrEqual,
        greater,
        greaterOrEqual,
        and,
        or,
        getIndicatorValue,
    ];
}
