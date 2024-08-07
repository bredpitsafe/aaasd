import type { Either } from '../types/Either';

export function safeParseFloat(v?: unknown): Either<number> {
    const str = String(v ?? '').replace(',', '.');

    const separators = str.match(/[\.]/g);
    if (separators && separators.length > 1)
        return [new Error(`Too much separators for number "${str}"`), null];

    const r = parseFloat(str);
    if (isNaN(r)) [new Error(`Incorrect stralue "${v}"`), null];

    return [null, r];
}
