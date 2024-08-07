import type { Nanoseconds } from '@common/types';

import { CHART_POINT_ITEM_SIZE, EChartPointItemOffset } from './defs';
import { createChartPoints, getStyleFactory } from './ModuleGetChartPoints.utils.ts';
import type { TGetPointsCoordsReturnType } from './ModuleGetIndicatorPoints.ts';

const mockFormula = jest.fn((x) => x);
const getStyle = getStyleFactory({ width: 1, color: 0x000000, opacity: 0 }, undefined);

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

        const { baseValue, items, absLeftPoint, absRightPoint } = createChartPoints(
            {
                size: input.values.length,
                items: input.values.map((y) => [0, y]).flat(),
                interval: [0 as Nanoseconds, 0 as Nanoseconds],
                baseValue: input.baseValue,
                absLeftPoint: { x: 0 as Nanoseconds, y: input.absLeftPointValue },
                absRightPoint: { x: 0 as Nanoseconds, y: input.absRightPointValue },
            } as TGetPointsCoordsReturnType,
            formula,
            getStyle,
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
