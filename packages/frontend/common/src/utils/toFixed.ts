export function toFixed(num: number, fractionDigits: number): number {
    return Number(Number(num).toFixed(fractionDigits));
}
