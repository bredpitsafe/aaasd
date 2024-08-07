import { v4 } from 'uuid';

const MAX_UINT32 = 2 ** 32 - 1;
const MAX_INT32 = 2 ** 31 - 1;
const MIN_INT32 = -(2 ** 31);
// TODO: replace everywhere to @common/utils
export function getRandomSign(): number {
    return Math.random() < 0.5 ? 1 : -1;
}

export function getRandomInt32(): number {
    return getRandomIntInclusive(MIN_INT32, MAX_INT32);
}

export function getRandomUint32(): number {
    return getRandomIntInclusive(0, MAX_UINT32);
}

export function getRandomIntInclusive(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomFloat64(): number {
    return Math.random() * Number.MAX_SAFE_INTEGER;
}

export function getRandomUuid(): string {
    return v4();
}
