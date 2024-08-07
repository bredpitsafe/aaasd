import type { Milliseconds, Someseconds } from '@common/types';
import {
    dayInMilliseconds,
    milliseconds2nanoseconds,
    minuteInMilliseconds,
    monthInMilliseconds,
    secondInMilliseconds,
} from '@common/utils';
import type { TimeseriesCharter } from '@frontend/charter/src';
import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import { EDefaultColors, string2hex } from '@frontend/common/src/utils/colors';
import type { TPackedRGBA } from '@frontend/common/src/utils/packRGBA';
import { packRGBA } from '@frontend/common/src/utils/packRGBA';

import type { TTestChartProps } from './defs';
import { TestChartType } from './generatePoints';
import { setMouseCoordinates } from './utils';

export enum ECaseName {
    SingleHerringbone = 'Single Herringbone',
    AllInOne = 'All in one',
    PartsConnection = 'Parts connection',
    MinMax = 'Min Max',
    FixedMinMax = 'Fixed Min Max',
    DisplayZero = 'Display zero point',
    PointsSelectionMultiple = 'Points selection multiple',
    PointsSelectionMultipleSpaces = 'Points selection multiple spaces',
    PointsSelectionMultipleNaN = 'Points selection multiple NaN',
    PointsSelectionSingle = 'Points selection single',
    PointsSelectionSingleSpaces = 'Points selection single spaces',
    PointsSelectionSingleNaN = 'Points selection single NaN',
    VerticalCrosshair = 'Vertical crosshair',
    VerticalAndHorizontalCrosshair = 'Vertical and horizontal crosshair',
    StairsShort = 'Stairs short lines',
    StairsShortPartConnection = 'Stairs short at part connection',
    MonthScale = 'Month scale',
    DayScale = 'Day scale',
    DayScaleWithMidnight = 'Day scale with midnight',
    MinuteScale = 'Minute scale',
    MinuteScaleWithMidnight = 'Minute scale with midnight',
    SecondScale = 'Second scale',
    ThickLinesSelfOverlap = 'Thick line self overlap with opacity',
    ThickLinesIntersection = 'Thick lines intersection with opacity',
    ThickLinesAndPoints = 'Thick lines and points with opacity',
    AutoScaleForPointsOutOfViewport = 'Auto scale for points out of viewport',
    LinesAndStairsPointsOutOfViewport = 'Lines and stairs points out of viewport',
    LinesAndStairsPointsOutOfViewportDifferentParts = 'Lines and stairs points out of viewport and different parts',
    LinesAndStairsPointsOutOfViewportStartPoint = 'Lines and stairs points out of viewport with single point',
    DotsChart = 'Dots charts',
    MinMaxWhenMaxLessThenMinChart = 'Min Max special case when maxY is less then chart min',
    MinMaxWhenMinGreaterThenMaxChart = 'Min Max special case when minY is greater then chart max',
    BindToRightYAxisGrid = 'Bind to right Y axis grid',
    DynamicSizeAndColorLines = 'Lines with dynamic Size and Color',
    DynamicSizeAndColorSteps = 'Steps with dynamic Size and Color',
    DynamicSizeAndColorPoints = 'Points with dynamic Size and Color',
    DynamicSizeAndColorDots = 'Dots with dynamic Size and Color',
    ClosestPoints = 'Closest Points',
}

export const casesMap: Record<
    ECaseName,
    {
        // Describe charts
        charts: TTestChartProps[];
        // Configure charter. I.e. set levels, min/max, etc.
        configure?: (charter: TimeseriesCharter) => (() => void) | void;
    }
> = {
    [ECaseName.SingleHerringbone]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e9,
                type: EChartType.stairs,
                width: 1,
                color: string2hex(EDefaultColors.chart),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
    },
    [ECaseName.AllInOne]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e3,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneBase1e4,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.lines,
                width: 2,
                color: string2hex('#88ff00'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            charter.setLevels([
                {
                    value: 1040,
                    width: 10,
                    color: string2hex('#004488'),
                    opacity: 0.5,
                    yAxis: EVirtualViewport.left,
                },
                {
                    value: 10_003,
                    width: 10,
                    color: string2hex('#880044'),
                    opacity: 0.5,
                    yAxis: EVirtualViewport.right,
                },
                {
                    top: 10085,
                    bottom: 10066,
                    width: 10,
                    color: string2hex('#448800'),
                    opacity: 0.5,
                    yAxis: EVirtualViewport.right,
                },
            ]);
        },
    },
    [ECaseName.PartsConnection]: {
        charts: [
            {
                id: TestChartType.PartsConnectionBase1e9,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.PartsConnectionBase1e7,
                type: EChartType.stairs,
                width: 3,
                color: string2hex('#00ff88'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.PartsConnectionBase0,
                type: EChartType.stairs,
                width: 1,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 12, 45) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },

    [ECaseName.MinMax]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e3,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneBase1e4,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.lines,
                width: 2,
                color: string2hex('#88ff00'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            charter.setMaxY(1200);
            charter.setMinY(1040);

            charter.setMaxYRight(10066);
            charter.setMinYRight(9000);
        },
    },
    [ECaseName.FixedMinMax]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e3,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneBase1e4,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.lines,
                width: 2,
                color: string2hex('#88ff00'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            charter.setFixedMaxY(2000);
            charter.setFixedMinY(500);

            charter.setFixedMaxYRight(10047);
            charter.setFixedMinYRight(9970);
        },
    },
    [ECaseName.DisplayZero]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e3,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneBase1e3,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.lines,
                width: 2,
                color: string2hex('#88ff00'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            charter.toggleDisplayZero(EVirtualViewport.left, true);
            charter.toggleDisplayZero(EVirtualViewport.right, true);
        },
    },

    [ECaseName.PointsSelectionMultiple]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e3,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneBase1e4,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.lines,
                width: 2,
                color: string2hex('#88ff00'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            return setMouseCoordinates(charter, 400, 250);
        },
    },
    [ECaseName.PointsSelectionMultipleSpaces]: {
        charts: [
            {
                id: TestChartType.HerringboneWithSpacesBase1e3,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneWithSpacesBase1e4,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusWithSpacesBase1e4,
                type: EChartType.lines,
                width: 2,
                color: string2hex('#88ff00'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            return setMouseCoordinates(charter, 280, 250);
        },
    },
    [ECaseName.PointsSelectionMultipleNaN]: {
        charts: [
            {
                id: TestChartType.HerringboneWithNaNBase1e3,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneWithNaNBase1e4,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusWithNaNBase1e4,
                type: EChartType.lines,
                width: 2,
                color: string2hex('#88ff00'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            return setMouseCoordinates(charter, 280, 250);
        },
    },
    [ECaseName.PointsSelectionSingle]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e3,
                type: EChartType.points,
                width: 5,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneBase1e4,
                type: EChartType.points,
                width: 5,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.points,
                width: 5,
                color: string2hex('#88ff00'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            return setMouseCoordinates(charter, 400, 280);
        },
    },
    [ECaseName.PointsSelectionSingleSpaces]: {
        charts: [
            {
                id: TestChartType.HerringboneWithSpacesBase1e3,
                type: EChartType.points,
                width: 5,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneWithSpacesBase1e4,
                type: EChartType.points,
                width: 5,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusWithSpacesBase1e4,
                type: EChartType.points,
                width: 5,
                color: string2hex('#88ff00'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            return setMouseCoordinates(charter, 280, 150);
        },
    },
    [ECaseName.PointsSelectionSingleNaN]: {
        charts: [
            {
                id: TestChartType.HerringboneWithNaNBase1e3,
                type: EChartType.points,
                width: 5,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneWithNaNBase1e4,
                type: EChartType.points,
                width: 5,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusWithNaNBase1e4,
                type: EChartType.points,
                width: 5,
                color: string2hex('#88ff00'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            return setMouseCoordinates(charter, 280, 150);
        },
    },

    [ECaseName.VerticalCrosshair]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e3,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setPseudoMouseCoords({ x: 400, y: 250 });
        },
    },

    [ECaseName.VerticalAndHorizontalCrosshair]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e3,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setPseudoHorizontalCrosshairVisibility(true);
            charter.setPseudoMouseCoords({ x: 420, y: 270 });
        },
    },

    [ECaseName.StairsShort]: {
        charts: [
            {
                id: TestChartType.ShortLinesBase0,
                type: EChartType.stairs,
                width: 43,
                color: string2hex('#0088ff'),
                opacity: 0.6,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.ShortLinesBase0,
                type: EChartType.stairs,
                width: 1,
                color: string2hex('#ff0088'),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setWorldWidth(
                milliseconds2nanoseconds((15 * minuteInMilliseconds) as Milliseconds),
            );
        },
    },
    [ECaseName.StairsShortPartConnection]: {
        charts: [
            {
                id: TestChartType.ShortLineAtPartEndFirstPartPointNaNBase0,
                type: EChartType.stairs,
                width: 43,
                color: string2hex('#000000'),
                opacity: 0.6,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.ShortLineAtPartEndFirstPartPointNaNBase0,
                type: EChartType.stairs,
                width: 1,
                color: string2hex('#ffffff'),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.ShortLineAtPartEndFirstPartPointValueBase1e3,
                type: EChartType.stairs,
                width: 43,
                color: string2hex('#FFFC00'),
                opacity: 0.6,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.ShortLineAtPartEndFirstPartPointValueBase1e3,
                type: EChartType.stairs,
                width: 1,
                color: string2hex('#ff00FF'),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 12, 45) as Milliseconds,
                ) as unknown as Someseconds,
            );
            charter.setWorldWidth(
                milliseconds2nanoseconds((15 * minuteInMilliseconds) as Milliseconds),
            );
        },
    },

    [ECaseName.MonthScale]: {
        charts: [
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.stairs,
                width: 1,
                color: string2hex(EDefaultColors.chart),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setWorldWidth(milliseconds2nanoseconds(monthInMilliseconds as Milliseconds));
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 0, 0) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.DayScale]: {
        charts: [
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.stairs,
                width: 1,
                color: string2hex(EDefaultColors.chart),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setWorldWidth(
                milliseconds2nanoseconds((dayInMilliseconds / 2) as Milliseconds),
            );
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 14, 0) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.DayScaleWithMidnight]: {
        charts: [
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.stairs,
                width: 1,
                color: string2hex(EDefaultColors.chart),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setWorldWidth(
                milliseconds2nanoseconds((dayInMilliseconds / 2) as Milliseconds),
            );
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 0, 0) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.MinuteScale]: {
        charts: [
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.stairs,
                width: 1,
                color: string2hex(EDefaultColors.chart),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setWorldWidth(milliseconds2nanoseconds(minuteInMilliseconds as Milliseconds));
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 14, 0) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.MinuteScaleWithMidnight]: {
        charts: [
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.stairs,
                width: 1,
                color: string2hex(EDefaultColors.chart),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setWorldWidth(milliseconds2nanoseconds(minuteInMilliseconds as Milliseconds));
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 0, 0) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.SecondScale]: {
        charts: [
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.stairs,
                width: 1,
                color: string2hex(EDefaultColors.chart),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setWorldWidth(milliseconds2nanoseconds(secondInMilliseconds as Milliseconds));
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 14, 0) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },

    [ECaseName.ThickLinesSelfOverlap]: {
        charts: [
            {
                id: TestChartType.PartsConnectionBase1e9,
                type: EChartType.stairs,
                width: 21,
                color: string2hex('#0088ff'),
                opacity: 0.7,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 12, 45) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.ThickLinesIntersection]: {
        charts: [
            {
                id: TestChartType.PartsConnectionBase1e4,
                type: EChartType.stairs,
                width: 21,
                color: string2hex('#0088ff'),
                opacity: 0.7,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.stairs,
                width: 35,
                color: string2hex('#ff0088'),
                opacity: 0.5,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 12, 45) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.ThickLinesAndPoints]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e4,
                type: EChartType.stairs,
                width: 40,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.PointsBase1e4,
                type: EChartType.points,
                width: 40,
                color: string2hex('#00ff88'),
                opacity: 0.2,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.stairs,
                width: 40,
                color: string2hex('#8800ff'),
                opacity: 0.3,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
    },

    [ECaseName.AutoScaleForPointsOutOfViewport]: {
        charts: [
            {
                id: TestChartType.PointsAtStartBase1e4,
                type: EChartType.stairs,
                width: 3,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.PointsAtStartBase1e3,
                type: EChartType.stairs,
                width: 3,
                color: string2hex('#00ff88'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 13, 45) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },

    [ECaseName.LinesAndStairsPointsOutOfViewport]: {
        charts: [
            {
                id: TestChartType.PointsAtStartEndBase1e3,
                type: EChartType.stairs,
                width: 3,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.PointsAtStartEndBase1e3,
                type: EChartType.lines,
                width: 3,
                color: string2hex('#00ff88'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 13, 45) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.LinesAndStairsPointsOutOfViewportDifferentParts]: {
        charts: [
            {
                id: TestChartType.PointsAtStartDifferentBase1e3,
                type: EChartType.stairs,
                width: 3,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.PointsAtStartDifferentBase1e3,
                type: EChartType.lines,
                width: 3,
                color: string2hex('#00ff88'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 13, 45) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.LinesAndStairsPointsOutOfViewportStartPoint]: {
        charts: [
            {
                id: TestChartType.PointsAtStartBase1e4,
                type: EChartType.stairs,
                width: 3,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.PointsAtStartBase1e3,
                type: EChartType.lines,
                width: 3,
                color: string2hex('#00ff88'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 13, 45) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },

    [ECaseName.DotsChart]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e3,
                type: EChartType.dots,
                width: 6,
                color: string2hex('#0088ff'),
                opacity: 0.6,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneBase1e4,
                type: EChartType.dots,
                width: 10,
                color: string2hex('#ff0088'),
                opacity: 0.6,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.dots,
                width: 20,
                color: string2hex('#88ff00'),
                opacity: 0.6,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
        configure(charter) {
            return setMouseCoordinates(charter, 400, 280);
        },
    },

    [ECaseName.MinMaxWhenMaxLessThenMinChart]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e4,
                type: EChartType.stairs,
                width: 1,
                color: string2hex(EDefaultColors.chart),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setMaxY(1);
        },
    },

    [ECaseName.MinMaxWhenMinGreaterThenMaxChart]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e4,
                type: EChartType.stairs,
                width: 1,
                color: string2hex(EDefaultColors.chart),
                opacity: 1,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setMinY(1e6);
        },
    },

    [ECaseName.BindToRightYAxisGrid]: {
        charts: [
            {
                id: TestChartType.HerringboneBase1e3,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#0088ff'),
                opacity: 0.8,
                visible: false,
                yAxis: EVirtualViewport.left,
            },
            {
                id: TestChartType.HerringboneBase1e4,
                type: EChartType.stairs,
                width: 2,
                color: string2hex('#ff0088'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.lines,
                width: 2,
                color: string2hex('#88ff00'),
                opacity: 0.8,
                visible: true,
                yAxis: EVirtualViewport.right,
            },
        ],
    },

    [ECaseName.DynamicSizeAndColorLines]: {
        charts: [
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.lines,
                getRGBA: getDynamicRGBA,
                getWidth: getDynamicWidth,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setWorldWidth(milliseconds2nanoseconds(monthInMilliseconds as Milliseconds));
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 0, 0) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.DynamicSizeAndColorSteps]: {
        charts: [
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.stairs,
                getRGBA: getDynamicRGBA,
                getWidth: getDynamicWidth,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setWorldWidth(milliseconds2nanoseconds(monthInMilliseconds as Milliseconds));
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 0, 0) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.DynamicSizeAndColorPoints]: {
        charts: [
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.points,
                getRGBA: getDynamicRGBA,
                getWidth: getDynamicWidth,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setWorldWidth(milliseconds2nanoseconds(monthInMilliseconds as Milliseconds));
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 0, 0) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.DynamicSizeAndColorDots]: {
        charts: [
            {
                id: TestChartType.SinusBase1e4,
                type: EChartType.dots,
                getRGBA: getDynamicRGBA,
                getWidth: getDynamicWidth,
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.setWorldWidth(milliseconds2nanoseconds(monthInMilliseconds as Milliseconds));
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 0, 0) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
    [ECaseName.ClosestPoints]: {
        charts: [
            {
                id: TestChartType.TwoPointsWithLeftPoint,
                type: EChartType.stairs,
                width: 5,
                color: string2hex(EDefaultColors.chart),
                visible: true,
                yAxis: EVirtualViewport.left,
            },
        ],
        configure(charter) {
            charter.focusTo(
                milliseconds2nanoseconds(
                    Date.UTC(2021, 8, 1, 12, 45) as Milliseconds,
                ) as unknown as Someseconds,
            );
        },
    },
};

function getDynamicRGBA(index: number): TPackedRGBA {
    return packRGBA(
        Math.abs(Math.trunc(Math.sin(index / 20) * 255)),
        Math.abs(Math.trunc(Math.cos(index / 20) * 255)),
        Math.abs(Math.trunc(Math.sin(index / 20) * Math.cos(index / 20) * 255)),
        100 + (index % 130),
    );
}
function getDynamicWidth(index: number): number {
    return 10 + (index % 40);
}
