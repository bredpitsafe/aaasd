import type { Nil } from '@common/types';
import { isNil } from 'lodash-es';

export function toArrayIfNotNil<T, F = undefined>(value: Nil | T, fallback?: F): F | T[] {
    return !isNil(value) ? [value] : (fallback as F);
}
