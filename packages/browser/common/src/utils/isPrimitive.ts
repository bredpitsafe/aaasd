import { isBoolean, isNil, isNumber, isString } from 'lodash-es';

import { TPrimitive } from '../types/primitive';

export function isPrimitive(value: unknown): value is TPrimitive {
    return isNil(value) || isString(value) || isNumber(value) || isBoolean(value);
}
