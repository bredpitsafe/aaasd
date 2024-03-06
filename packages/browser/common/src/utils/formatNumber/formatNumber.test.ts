import { formatNumber, formatUsd, formatUsdCompact } from './formatNumber';

describe('formatNumber', () => {
    it('formats full numbers', () => {
        expect(formatNumber(123, {})).toBe('123');
        expect(formatNumber(123_456_789, {})).toBe('123,456,789');
        expect(
            formatNumber(123.45, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        ).toBe('123.45');
    });

    it('formats compact numbers', () => {
        expect(formatNumber(123, { notation: 'compact' })).toBe('123');
        expect(formatNumber(1_234, { notation: 'compact' })).toBe('1.2k');
        expect(formatNumber(1_234_567, { notation: 'compact' })).toBe('1.2M');
    });

    it('formats full USD', () => {
        expect(formatUsd(123.45)).toBe('$123.45');
        expect(formatUsd(1_234.56)).toBe('$1,234.6');
        expect(formatUsd(12_345.67)).toBe('$12,345.67');
        expect(formatUsd(123_456.78)).toBe('$123,456.78');
        expect(formatUsd(123_456_789.01)).toBe('$123,456,789.01');
    });

    it('formats compact USD', () => {
        expect(formatUsdCompact(123.45)).toBe('$123.45');
        expect(formatUsdCompact(1_234.56)).toBe('$1,234.6');
        expect(formatUsdCompact(12_345.67)).toBe('$12.35k');
        expect(formatUsdCompact(123_456.78)).toBe('$123.46k');
        expect(formatUsdCompact(123_456_789.01)).toBe('$123.46M');
    });
});
