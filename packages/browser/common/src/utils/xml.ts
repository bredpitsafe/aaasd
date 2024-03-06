import type { Properties } from 'csstype';
import { camelCase, isEmpty, isNil, mapKeys, pickBy } from 'lodash-es';

import type { TXmlToJsonArray } from '../types/xml';

export function wrapToArray<T>(elementOrArray?: TXmlToJsonArray<T>): T[] | undefined {
    if (isNil(elementOrArray) || isEmpty(elementOrArray)) {
        return undefined;
    }

    return Array.isArray(elementOrArray) ? elementOrArray : [elementOrArray];
}

export function wrapToElement<T>(elementOrArray?: T): T | undefined {
    if (isEmpty(elementOrArray)) {
        return undefined;
    }

    return elementOrArray;
}

export function getStyleFromXmlElement(
    element: {},
    baseStyle?: Properties,
): Properties | undefined {
    const stylePrefix = 'style';
    const excludedReservedNames = new Set(['styleConverter', 'styleIndicator']);
    const rawStyle = pickBy(
        element as Properties,
        (_, key) =>
            key.length > stylePrefix.length &&
            key.startsWith(stylePrefix) &&
            !excludedReservedNames.has(key),
    );

    const calculatedStyle: Properties = mapKeys(rawStyle, (_, key: string) =>
        camelCase(key.substring(stylePrefix.length)),
    );

    const style = {
        ...baseStyle,
        ...calculatedStyle,
    };

    return isEmpty(style) ? undefined : style;
}
