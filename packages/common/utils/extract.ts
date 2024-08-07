import type { Nil } from '@common/types';

/**
 * @public
 */
export function extractValidNumber<T extends number>(v: string | number | Nil): T | undefined {
    if (typeof v === 'number') {
        return isNaN(v) || !isFinite(v) ? undefined : (v as T);
    }

    const parsed = Number(extractValidString(v));

    return !isNaN(parsed) && isFinite(parsed) ? (parsed as T) : undefined;
}

/**
 * @public
 */
export function extractValidString<T extends string>(v: string | Nil | void): T | undefined {
    return typeof v === 'string' && v.trim() !== '' ? (v.trim() as T) : undefined;
}
