import type { ISO, Nil } from '@common/types';
import { isISO, NanoDate } from '@common/utils';
import { isEmpty, isNil } from 'lodash-es';

import type { TBase64 } from './base64';
import { base64ToObject } from './base64';

export function extractValidString<T extends string>(v: string | Nil | void): T | undefined {
    return typeof v === 'string' && v.trim() !== '' ? (v.trim() as T) : undefined;
}

export function extractValidISO(v: string | Nil): ISO | undefined {
    const value = extractValidString(v);
    return isISO(value) ? new NanoDate(value).toISOStringNanoseconds() : undefined;
}

export function extractValidNumber<T extends number>(v: string | number | Nil): T | undefined {
    if (typeof v === 'number') {
        return isNaN(v) || !isFinite(v) ? undefined : (v as T);
    }

    const parsed = Number(extractValidString(v));

    return !isNaN(parsed) && isFinite(parsed) ? (parsed as T) : undefined;
}

export function extractValidEnum<T>(v: string | Nil, enm: object): T | undefined {
    v = extractValidString(v);
    return typeof v === 'string' && Object.values(enm).includes(v as unknown as T)
        ? (v as unknown as T)
        : undefined;
}

export function extractValidBoolean(v: string | Nil): boolean | undefined {
    v = extractValidString(v);

    if (v === 'true') return true;
    if (v === 'false') return false;
    return undefined;
}

export function extractValidColor(color: string | number | Nil): number | undefined {
    if (color === null || color === undefined) {
        return undefined;
    }

    const number = extractValidNumber(color);

    if (typeof number === 'number') {
        return number;
    }

    let hexColor = color as string;

    // #ffffff
    if (hexColor.startsWith('#')) {
        hexColor = hexColor.slice(1);
    }

    // ffffff => 0xffffff
    if (!hexColor.startsWith('0x')) {
        hexColor = `0x${hexColor}`;
    }

    return extractValidNumber(hexColor);
}

export function extractValidObjectFromBase64<T extends object>(v: TBase64<T> | Nil): T | undefined {
    if (isNil(v) || isEmpty(v)) {
        return undefined;
    }

    try {
        return base64ToObject(v);
    } catch {
        return undefined;
    }
}
