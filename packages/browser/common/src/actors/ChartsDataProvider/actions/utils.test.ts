import type { Nanoseconds } from '../../../types/time';
import type { TGetChartPointsProps, TGetPointsCoordsReturnType } from './defs';
import { CHART_POINT_ITEM_SIZE, EChartPointItemOffset } from './defs';
import { getChartPartPoints } from './utils';

const mockFormula = jest.fn((x) => x);

jest.mock('../../../utils/Sandboxes/numberConversion.ts', () => ({
    getNumberConversionSandbox:
        () =>
        ({ value }: { value: number }) =>
            mockFormula(value),
}));

describe('Function getChartPartPoints', () => {
    beforeAll(() => {
        mockFormula.mockImplementation((value) => value * 2 + 0.1);
    });

    test.each([
        {
            case: 'All points filled',
            formula: (value: number): number => value * 2 + 0.1,
            input: {
                baseValue: 0,
                values: [5, 15, 55, 85, 95],
                absLeftPointValue: 1,
                absRightPointValue: 100,
            },
            expected: {
                baseValue: 0.1,
                values: [10, 30, 110, 170, 190],
                absLeftPointValue: 2.1,
                absRightPointValue: 200.1,
            },
        },
    ])('Should apply formula for points, case "$case"', ({ formula, input, expected }) => {
        mockFormula.mockImplementation(formula);

        const { baseValue, items, absLeftPoint, absRightPoint } = getChartPartPoints(
            {
                size: input.values.length,
                items: input.values.map((y) => [0, y]).flat(),
                interval: [0 as Nanoseconds, 0 as Nanoseconds],
                baseValue: input.baseValue,
                absLeftPoint: { x: 0 as Nanoseconds, y: input.absLeftPointValue },
                absRightPoint: { x: 0 as Nanoseconds, y: input.absRightPointValue },
            } as TGetPointsCoordsReturnType,
            { style: { color: 0 } } as TGetChartPointsProps,
        );

        const values = items.filter(
            (_, index) => index % CHART_POINT_ITEM_SIZE === EChartPointItemOffset.y,
        );

        expect(baseValue).toEqual(expected.baseValue);
        expect(values).toEqual(expected.values);
        expect(absLeftPoint?.y).toEqual(expected.absLeftPointValue);
        expect(absRightPoint?.y).toEqual(expected.absRightPointValue);
    });
});
