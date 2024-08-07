import type { Milliseconds, Someseconds } from '@common/types';
import { plus } from '@common/utils';
import { milliseconds2nanoseconds } from '@common/utils';
import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import type {
    TRequestClosestPointsProps,
    TRequestPartsProps,
} from '@frontend/charter/src/services/PartsLoader';

import type { TPointsSet } from './utils';
import type { TClosestPoint } from './utils';

type TDataGenerator = {
    generatePoints: (
        requestBody: TRequestPartsProps,
        serverTimeIncrement: Milliseconds,
        size: number,
    ) => TPointsSet[];
    generateClosestPoints: (
        requestBody: TRequestClosestPointsProps,
        serverTimeIncrement: Milliseconds,
    ) => [TClosestPoint, TClosestPoint];
};

export const TestChartType = {
    HerringboneBase1e16: <TSeriesId>'Herringbone1e16',
    HerringboneBase1e9: <TSeriesId>'Herringbone1e9',
    HerringboneBase1e4: <TSeriesId>'Herringbone1e4',
    HerringboneBase1e3: <TSeriesId>'Herringbone1e3',
    SinusBase1e4: <TSeriesId>'Sinus1e4',
    HerringboneWithSpacesBase1e9: <TSeriesId>'HerringboneWithSpaces1e9',
    HerringboneWithSpacesBase1e4: <TSeriesId>'HerringboneWithSpaces1e4',
    HerringboneWithSpacesBase1e3: <TSeriesId>'HerringboneWithSpaces1e3',
    SinusWithSpacesBase1e4: <TSeriesId>'SinusWithSpaces1e4',
    HerringboneWithNaNBase1e9: <TSeriesId>'HerringboneWithNaN1e9',
    HerringboneWithNaNBase1e4: <TSeriesId>'HerringboneWithNaN1e4',
    HerringboneWithNaNBase1e3: <TSeriesId>'HerringboneWithNaN1e3',
    SinusWithNaNBase1e4: <TSeriesId>'SinusWithNaN1e4',
    PartsConnectionBase1e9: <TSeriesId>'PartsConnection1e9',
    PartsConnectionBase1e7: <TSeriesId>'PartsConnection1e7',
    PartsConnectionBase1e4: <TSeriesId>'PartsConnection1e4',
    PartsConnectionBase0: <TSeriesId>'PartsConnection0',
    ShortLinesBase0: <TSeriesId>'ShortLinesBase0',
    ShortLineAtPartEndFirstPartPointNaNBase0: <TSeriesId>'ShortLineAtPartEndFirstPartPointNaN0',
    ShortLineAtPartEndFirstPartPointValueBase0: <TSeriesId>'ShortLineAtPartEndFirstPartPointValue0',
    ShortLineAtPartEndFirstPartPointNaNBase1e3: <TSeriesId>'ShortLineAtPartEndFirstPartPointNaN1e3',
    ShortLineAtPartEndFirstPartPointValueBase1e3: <TSeriesId>(
        'ShortLineAtPartEndFirstPartPointValue1e3'
    ),
    PointsBase1e4: <TSeriesId>'Points1e4',
    PointsAtStartBase1e4: <TSeriesId>'PointsAtStart1e4',
    PointsAtStartBase1e3: <TSeriesId>'PointsAtStart1e3',
    PointsAtStartEndBase1e4: <TSeriesId>'PointsAtStartEnd1e4',
    PointsAtStartEndBase1e3: <TSeriesId>'PointsAtStartEnd1e3',
    PointsAtStartDifferentBase1e4: <TSeriesId>'PointsAtStartDifferent1e4',
    PointsAtStartDifferentBase1e3: <TSeriesId>'PointsAtStartDifferent1e3',
    TwoPointsWithLeftPoint: <TSeriesId>'TwoPointsWithLeftPoint',
};

export function getDataGenerator(seriesId: TSeriesId): TDataGenerator {
    return (
        pointsGenerationMap.get(seriesId.split('|')[0] as TSeriesId) ?? {
            generatePoints: generateEmptyPoints,
            generateClosestPoints: generateEmptyClosestPoints,
        }
    );
}

const pointsGenerationMap = new Map<TSeriesId, TDataGenerator>([
    [
        TestChartType.HerringboneBase1e16,
        {
            generatePoints: pointsHerringboneBuilder(1e16),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.HerringboneBase1e9,
        {
            generatePoints: pointsHerringboneBuilder(1e9),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.HerringboneBase1e4,
        {
            generatePoints: pointsHerringboneBuilder(1e4),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.HerringboneBase1e3,
        {
            generatePoints: pointsHerringboneBuilder(1e3),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.SinusBase1e4,
        {
            generatePoints: pointsSinusBuilder(1e4),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.HerringboneWithSpacesBase1e9,
        {
            generatePoints: pointsHerringboneBuilder(1e9, undefined, 50, false),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.HerringboneWithSpacesBase1e4,
        {
            generatePoints: pointsHerringboneBuilder(1e4, undefined, 50, false),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.HerringboneWithSpacesBase1e3,
        {
            generatePoints: pointsHerringboneBuilder(1e3, undefined, 50, false),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.SinusWithSpacesBase1e4,
        {
            generatePoints: pointsSinusBuilder(1e4, undefined, undefined, 50, false),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.HerringboneWithNaNBase1e9,
        {
            generatePoints: pointsHerringboneBuilder(1e9, undefined, 50, true),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.HerringboneWithNaNBase1e4,
        {
            generatePoints: pointsHerringboneBuilder(1e4, undefined, 50, true),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.HerringboneWithNaNBase1e3,
        {
            generatePoints: pointsHerringboneBuilder(1e3, undefined, 50, true),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.SinusWithNaNBase1e4,
        {
            generatePoints: pointsSinusBuilder(1e4, undefined, undefined, 50, true),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.PartsConnectionBase1e9,
        {
            generatePoints: pointsPartsConnectionBuilder(1e9, 1e7),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.PartsConnectionBase1e7,
        {
            generatePoints: pointsPartsConnectionBuilder(1e5, 1e7),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.PartsConnectionBase1e4,
        {
            generatePoints: pointsPartsConnectionBuilder(1e4, 1e4),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.PartsConnectionBase0,
        {
            generatePoints: pointsPartsConnectionBuilder(0),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.ShortLinesBase0,
        {
            generatePoints: pointsShortLinesBuilder(0),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.ShortLineAtPartEndFirstPartPointNaNBase0,
        {
            generatePoints: pointsShortLineAtPartEndBuilder(0, true),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.ShortLineAtPartEndFirstPartPointValueBase0,
        {
            generatePoints: pointsShortLineAtPartEndBuilder(0, false),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.ShortLineAtPartEndFirstPartPointNaNBase1e3,
        {
            generatePoints: pointsShortLineAtPartEndBuilder(1e3, true),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.ShortLineAtPartEndFirstPartPointValueBase1e3,
        {
            generatePoints: pointsShortLineAtPartEndBuilder(1e3, false),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.PointsBase1e4,
        {
            generatePoints: pointsRangeFillBuilder(1e4 - 90, 180),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.PointsAtStartBase1e4,
        {
            generatePoints: pointsAtStartBuilder(1e4),
            generateClosestPoints: pointsAtStartEdgeBuilder(1e4),
        },
    ],
    [
        TestChartType.PointsAtStartBase1e3,
        {
            generatePoints: pointsAtStartBuilder(1e3),
            generateClosestPoints: pointsAtStartEdgeBuilder(1e3),
        },
    ],
    [
        TestChartType.PointsAtStartEndBase1e4,
        {
            generatePoints: pointsAtStartEndBuilder(1e4 - 100, 1e4 + 100),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.PointsAtStartEndBase1e3,
        {
            generatePoints: pointsAtStartEndBuilder(1e3 - 100, 1e3 + 100),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.PointsAtStartDifferentBase1e4,
        {
            generatePoints: pointsAtStartDifferentBuilder(1e4 - 100, 1e4 + 100),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.PointsAtStartDifferentBase1e3,
        {
            generatePoints: pointsAtStartDifferentBuilder(1e3 - 100, 1e3 + 100),
            generateClosestPoints: generateEmptyClosestPoints,
        },
    ],
    [
        TestChartType.TwoPointsWithLeftPoint,
        {
            generatePoints: singlePointBuilder(100),
            generateClosestPoints: generateClosestPoints(50),
        },
    ],
]);

function pointsHerringboneBuilder(
    baseValue: number,
    height = 100,
    spacesInData = 0,
    replaceSpacesWithNaN = false,
) {
    const skewTimePeriod = 30;

    return function (
        { maxInterval: duration, timestep }: TRequestPartsProps,
        serverTimeIncrement: Milliseconds,
        size: number,
    ): TPointsSet[] {
        const pointsSet: TPointsSet[] = [];
        let pointsIndex = 0;
        let increment = 0;

        while (1) {
            let time = 0;
            let itemsIndex = 0;

            if (timestep + increment >= duration) {
                break;
            }

            pointsSet[pointsIndex] = { increment, items: [] };

            const items = pointsSet[pointsIndex].items;

            while (itemsIndex < size * 2) {
                const inc = timestep * (itemsIndex % skewTimePeriod);

                if (increment + time + inc > duration) {
                    break;
                }

                time += inc;

                const hasValue =
                    spacesInData <= 0 || Math.trunc(items.length / (2 * spacesInData)) % 2 === 0;

                if (hasValue) {
                    items.push(time);
                    items.push((itemsIndex % height) + baseValue);
                } else if (replaceSpacesWithNaN) {
                    items.push(time);
                    items.push(NaN);
                } else if (items.length >= 2) {
                    items.push(...items.slice(-2));
                }

                itemsIndex += 2;
            }

            increment += time;
            pointsIndex++;
        }

        return pointsSet;
    };
}

function pointsSinusBuilder(
    baseValue: number,
    period = 1000,
    height = 100,
    spacesInData = 0,
    replaceSpacesWithNaN = false,
) {
    return function (
        { maxInterval: duration, timestep }: TRequestPartsProps,
        serverTimeIncrement: Milliseconds,
        size: number,
    ): TPointsSet[] {
        const pointsSet: TPointsSet[] = [];
        let pointsIndex = 0;
        let increment = 0;

        while (1) {
            let time = 0;
            let itemsIndex = 0;

            if (timestep + increment >= duration) {
                break;
            }

            pointsSet[pointsIndex] = { increment, items: [] };

            const items = pointsSet[pointsIndex].items;

            while (itemsIndex < size * 2) {
                const inc = timestep * (itemsIndex % 30);

                if (increment + time + inc > duration) {
                    break;
                }

                time += inc;

                const hasValue =
                    spacesInData <= 0 || Math.trunc(items.length / (2 * spacesInData)) % 2 === 0;

                if (hasValue) {
                    items.push(time);
                    items.push(
                        Math.sin(2 * Math.PI * ((itemsIndex % period) / period)) * height +
                            baseValue,
                    );
                } else if (replaceSpacesWithNaN) {
                    items.push(time);
                    items.push(NaN);
                } else if (items.length >= 2) {
                    items.push(...items.slice(-2));
                }

                itemsIndex += 2;
            }

            increment += time;
            pointsIndex++;
        }

        return pointsSet;
    };
}

function pointsPartsConnectionBuilder(baseValue: number, range = 1e3) {
    return function (
        { maxInterval: duration, timestep }: TRequestPartsProps,
        serverTimeIncrement: Milliseconds,
        size: number,
    ): TPointsSet[] {
        const padding = 1000 * timestep;
        const chartStep = 60 * timestep;

        const pointsSet: TPointsSet[] = [];
        let pointsIndex = 0;
        let increment = 0;

        while (1) {
            let time = padding;
            let itemsIndex = 0;

            if (timestep + increment >= duration - padding) {
                break;
            }

            pointsSet[pointsIndex] = { increment, items: [] };

            const items = pointsSet[pointsIndex].items;

            while (itemsIndex < size * 2) {
                if (increment + time + chartStep > duration - padding) {
                    break;
                }

                time += chartStep;
                items.push(time);
                items.push(((itemsIndex % 11) - 5) * range + baseValue);

                itemsIndex += 2;
            }

            increment += time;
            pointsIndex++;
        }

        return pointsSet;
    };
}

function pointsShortLinesBuilder(baseValue: number) {
    const valuesArray = [
        ...Array(90).fill(110),
        //
        ...Array(20).fill(NaN),
        //
        ...Array(3).fill(100),
        //
        ...Array(15).fill(NaN),
        //
        ...Array(2).fill(90),
        //
        ...Array(10).fill(NaN),
        //
        ...Array(2).fill(80),
        //
        NaN,
        //
        70,
        //
        NaN,
        //
        60,
        NaN,
    ];

    return function (
        { maxInterval: duration, timestep }: TRequestPartsProps,
        serverTimeIncrement: Milliseconds,
        size: number,
    ): TPointsSet[] {
        let valuesIndex = 0;
        function getNextValue(): number {
            return valuesArray[valuesIndex++ % valuesArray.length] + baseValue;
        }

        const pointsSet: TPointsSet[] = [];
        let pointsIndex = 0;
        let increment = 0;

        while (1) {
            let time = 0;
            let itemsIndex = 0;

            if (timestep + increment >= duration) {
                break;
            }

            pointsSet[pointsIndex] = { increment, items: [] };

            const items = pointsSet[pointsIndex].items;

            while (itemsIndex < size * 2) {
                const inc = 4 * timestep;

                if (increment + time + inc > duration) {
                    break;
                }

                time += inc;
                items.push(time);
                items.push(getNextValue());

                itemsIndex += 2;
            }

            increment += time;
            pointsIndex++;
        }

        return pointsSet;
    };
}

function pointsShortLineAtPartEndBuilder(baseValue: number, firstNaN: boolean) {
    function getNextValue(pointIndex: number): number {
        if (pointIndex === 0) {
            return firstNaN ? NaN : 100 + baseValue;
        }

        if (pointIndex > 4090) {
            return 100 + baseValue;
        }

        return NaN;
    }

    return function (
        { maxInterval: duration, timestep }: TRequestPartsProps,
        serverTimeIncrement: Milliseconds,
        size: number,
    ): TPointsSet[] {
        const pointsSet: TPointsSet[] = [];
        let pointsIndex = 0;
        let increment = 0;

        while (1) {
            let time = 0;
            let itemsIndex = 0;

            if (timestep + increment >= duration) {
                break;
            }

            pointsSet[pointsIndex] = { increment, items: [] };

            const items = pointsSet[pointsIndex].items;

            while (itemsIndex < size * 2) {
                if (increment + time + timestep > duration) {
                    break;
                }

                time += timestep;
                items.push(time);
                items.push(getNextValue(itemsIndex / 2));

                itemsIndex += 2;
            }

            increment += time;
            pointsIndex++;
        }

        return pointsSet;
    };
}

function pointsRangeFillBuilder(baseValue: number, height = 100, randomizeStep = 337) {
    return function (
        { maxInterval: duration, timestep }: TRequestPartsProps,
        serverTimeIncrement: Milliseconds,
        size: number,
    ): TPointsSet[] {
        const pointsSet: TPointsSet[] = [];
        let pointsIndex = 0;
        let increment = 0;
        const timeSpace = 10;

        while (1) {
            let time = 0;
            let itemsIndex = 0;

            if (timestep * timeSpace + increment >= duration) {
                break;
            }

            pointsSet[pointsIndex] = { increment, items: [] };

            const items = pointsSet[pointsIndex].items;

            while (itemsIndex < size * 2) {
                const inc = timestep * timeSpace;

                if (increment + time + inc > duration) {
                    break;
                }

                time += inc;

                items.push(time);
                items.push(((itemsIndex * randomizeStep) % height) + baseValue);

                itemsIndex += 2;
            }

            increment += time;
            pointsIndex++;
        }

        return pointsSet;
    };
}

function pointsAtStartBuilder(baseValue: number) {
    return function (): TPointsSet[] {
        return [{ increment: 0, items: [0, baseValue] }];
    };
}
function pointsAtStartEdgeBuilder(value: number) {
    return function generateEmptyClosestPoints(
        { startTime }: TRequestClosestPointsProps,
        serverTimeIncrement: Milliseconds,
    ): [TClosestPoint, TClosestPoint] {
        const ts = plus(milliseconds2nanoseconds(serverTimeIncrement), startTime) as Someseconds;
        return [
            {
                ts,
                value,
            },
            null,
        ];
    };
}

function generateEmptyClosestPoints(): [TClosestPoint, TClosestPoint] {
    return [null, null];
}

function pointsAtStartEndBuilder(baseValueLeft: number, baseValueRight: number) {
    return function ({ maxInterval }: TRequestPartsProps): TPointsSet[] {
        return [
            {
                increment: 0,
                items: [0, baseValueLeft, maxInterval, baseValueRight],
            },
        ];
    };
}

function pointsAtStartDifferentBuilder(baseValueLeft: number, baseValueRight: number) {
    return function ({ maxInterval, timestep }: TRequestPartsProps): TPointsSet[] {
        return [
            { increment: 0, items: [0, baseValueLeft] },
            { increment: maxInterval - timestep, items: [0, baseValueRight] },
        ];
    };
}

function singlePointBuilder(baseValueLeft: number, counter = 1) {
    return function (): TPointsSet[] {
        if (counter-- <= 0) {
            return [];
        }

        return [{ increment: 0, items: [100, baseValueLeft, 100, NaN] }];
    };
}

function generateEmptyPoints(): TPointsSet[] {
    return [{ increment: 0, items: [] }];
}

function generateClosestPoints(baseValueLeft: number, counter = 1) {
    return function (): [TClosestPoint, TClosestPoint] {
        if (counter-- <= 0) {
            return [null, null];
        }

        return [{ ts: 50, value: baseValueLeft }, null];
    };
}
