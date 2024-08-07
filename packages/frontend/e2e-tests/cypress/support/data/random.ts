import { v4 as uuid } from 'uuid';

export function getUuid(): string {
    const uuidValue = `_${uuid()}`;
    return uuidValue.slice(0, 16);
}

export function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function roundToFixed(value: number, precision: number): number {
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
}

function findGCD(a: number, b: number): number {
    const epsilon = 1e-10;

    while (Math.abs(b) > epsilon) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}
export function findLCM(a: number, b: number): number {
    const gcd = findGCD(a, b);
    return (a * b) / gcd;
}

export function formatNumber(number, decimals) {
    let fixedNumber = number.toFixed(decimals);

    if (!fixedNumber.includes('.')) {
        fixedNumber += '.' + '0'.repeat(decimals);
    } else {
        const parts = fixedNumber.split('.');
        if (parts[1].length < decimals) {
            fixedNumber += '0'.repeat(decimals - parts[1].length);
        }
    }

    return fixedNumber;
}
