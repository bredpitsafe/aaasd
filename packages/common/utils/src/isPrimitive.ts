import type { TPrimitive } from '@common/types';
import { isBoolean, isNil, isNumber, isString } from 'lodash-es';

export function isPrimitive(value: unknown): value is TPrimitive {
    return isNil(value) || isString(value) || isNumber(value) || isBoolean(value);
}
