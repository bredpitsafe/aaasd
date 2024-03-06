export const FLOAT_DECIMALS_SEPARATOR = '.';
export const FLOAT_EXPONENT_MARKER = 'e';

/**
 * @deprecated
 */
export function plus<A extends number, B extends number, C = A>(a: A, b: B): C {
    return (a + b) as unknown as C;
}

/**
 * @deprecated
 */
export function minus<A extends number, B extends number, C = A>(a: A, b: B): C {
    return (a - b) as unknown as C;
}

export function sum<A extends number>(a: A, ...rest: number[]): A {
    for (let i = 0; i < rest.length; i++) {
        a = (a + rest[i]) as A;
    }
    return a;
}

export function mul<A extends number, B extends number, C = A>(a: A, b: B): C {
    return (a * b) as unknown as C;
}

export function div<A extends number, B extends number, C = A>(a: A, b: B): C {
    return (a / b) as unknown as C;
}

export function mod<A extends number, B extends number, C = A>(a: A, b: B): C {
    return (a % b) as unknown as C;
}

export function max<A extends number, B extends number, C = A>(a: A, b: B): C {
    return Math.max(a, b) as unknown as C;
}

export function min<A extends number, B extends number, C = A>(a: A, b: B): C {
    return Math.min(a, b) as unknown as C;
}

export function getEdgeNumberPosition(value: number) {
    return getExponent(value, (logFactor) => {
        const ceil = Math.ceil(logFactor);

        return ceil === logFactor ? ceil + 1 : ceil;
    });
}

export function getRealExponent(value: number) {
    return getExponent(value, (logFactor) => Math.floor(logFactor));
}

function getExponent(value: number, processPositiveLogFactor: (logFactor: number) => number) {
    if (isNaN(value) || !isFinite(value)) {
        return Math.abs(value);
    }

    if (value === 0) {
        return 0;
    }

    const absValue = Math.abs(value);

    if (absValue >= 1 && absValue < 10) {
        return processPositiveLogFactor(0);
    }

    const logFactor = Math.log10(absValue);

    if (logFactor === 0) {
        return 0;
    }

    if (logFactor < 0) {
        return Math.floor(logFactor);
    }

    return processPositiveLogFactor(logFactor);
}

export function getMeaningDifference(value: number, toleranceFactor: number): number {
    if (isNaN(value) || !isFinite(value)) {
        return NaN;
    }

    const roundLogFactor = getEdgeNumberPosition(value);
    const rawTolerance = parseFloat(`1e${roundLogFactor - toleranceFactor}`);

    return Number.isFinite(rawTolerance) && rawTolerance > Number.EPSILON
        ? rawTolerance
        : Number.EPSILON;
}

export function areEqualWithTolerance(
    first: number,
    second: number,
    insignificantDifference: number,
): boolean {
    if (isNaN(insignificantDifference)) {
        return first === second;
    }

    return Math.abs(first - second) < insignificantDifference;
}

export function getFractionDigitsCount(value: number): number {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
        return NaN;
    }

    const [numberPart, exponentPart = '0'] = value.toString().split(FLOAT_EXPONENT_MARKER);

    const exponent = parseInt(exponentPart, 10);
    const numberDigits = numberPart.split(FLOAT_DECIMALS_SEPARATOR)[1]?.length ?? 0;

    return Math.max(numberDigits - exponent, 0);
}
