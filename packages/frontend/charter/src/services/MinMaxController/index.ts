import { minus, plus } from '@common/utils';
import { isNil } from 'lodash-es';
import { combineLatestWith, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import type { TPart } from '../../../lib/Parts/def';
import { toAbsPointValue } from '../../../lib/Parts/utils/point';
import { createLocalState, getState } from '../../Charter/methods';
import { EVirtualViewport } from '../../components/ChartViewport/defs';
import type { IContext } from '../../types';
import { createPartsChangeDetector } from '../../utils/Detectors/createPartsChangeDetector';
import { createValueChangeDetector } from '../../utils/Detectors/createValueChangeDetector';
import { createViewportChangeDetector } from '../../utils/Detectors/createViewportChangeDetector';
import type { TAllViewportData, TMinMax, TPartialMinMax, TViewportData } from './defs';
import { DisplayZeroController } from './DisplayZeroController';
import { getPartMinMax } from './getPartMinMax';
import {
    getClosestAbsLeftValue,
    getClosestAbsRightValue,
    getMax,
    getMin,
    getMinMaxPair,
    getMostRelevantSide,
    getNearestFromRange,
    isWideScaled,
    keepValidMinMax,
    minMaxWithOptimalDiff,
    shouldConsiderLeftPoint,
    shouldConsiderRightPoint,
} from './utils';

export class MinMaxController {
    private readonly state: {
        minMax: Record<EVirtualViewport, TMinMax>;
        prevLeftRight: TMinMax;
        lastValidMinMax: TMinMax;
    };

    private readonly partsChangeDetector = createPartsChangeDetector();
    private readonly viewportChangeDetector = createViewportChangeDetector(getMostRelevantSide);
    private readonly settingsChangeDetector = createValueChangeDetector<(number | undefined)[]>(
        undefined,
        (prev, next) => prev.every((value, index) => value === next[index]),
    );

    private readonly destroyer$ = new Subject<void>();

    private readonly displayZeroController: DisplayZeroController;

    constructor(private readonly ctx: IContext) {
        this.state = createLocalState(
            ctx,
            'MinMaxController',
            (state) =>
                state ?? {
                    minMax: Object.seal({
                        [EVirtualViewport.left]: [Infinity, -Infinity],
                        [EVirtualViewport.right]: [Infinity, -Infinity],
                    }),
                    prevLeftRight: [0, 0],
                    lastValidMinMax: [-1, 1],
                },
        );
        this.displayZeroController = new DisplayZeroController(this.ctx);

        ctx.tickerController
            .getTicker$()
            .pipe(
                map(this.getAllViewportData),
                filter(this.shouldUpdateMinMax),
                combineLatestWith(this.displayZeroController.update$),
                takeUntil(this.destroyer$),
            )
            .subscribe(([{ viewports }]) => this.updateAllMinMax(viewports));
    }

    destroy(): void {
        this.destroyer$.next();
        this.destroyer$.complete();
    }

    getMinMax(): TMinMax {
        this.state.lastValidMinMax =
            this.getMinMaxForYAxis(EVirtualViewport.left) ??
            this.getMinMaxForYAxis(EVirtualViewport.right) ??
            this.state.lastValidMinMax;

        return this.state.lastValidMinMax;
    }

    getVirtualViewportsMinMax(): Record<EVirtualViewport, TMinMax> {
        return this.state.minMax;
    }

    toggleDisplayZero(axis: EVirtualViewport, value?: boolean): boolean {
        return this.displayZeroController.toggleDisplayZero(axis, value);
    }

    private getMinMaxForYAxis(yAxis: EVirtualViewport): undefined | TMinMax {
        const {
            state: { minMax },
            ctx: { chartsController },
        } = this;

        return !isWideScaled(minMax[yAxis]) && chartsController.hasChartsOnAxis(yAxis)
            ? minMax[yAxis]
            : undefined;
    }

    private getAllViewportData = (): TAllViewportData => {
        const { partsController, chartsController, virtualViewportController } = this.ctx;
        const visibleCharts = chartsController.getVisibleChartsProps();

        const allParts: TPart[] = [];
        const viewports: TViewportData[] = [];

        for (const yAxis of virtualViewportController.getVisibleVirtualViewportNames()) {
            const viewportData: TViewportData = {
                yAxis,
                parts: [],
                groupedParts: [],
            };

            for (const chart of visibleCharts) {
                if (chart.yAxis !== yAxis) continue;

                const chartParts = partsController.getVisibleParts(chart.id);

                allParts.push(...chartParts);
                viewportData.parts.push(...chartParts);
                viewportData.groupedParts.push(chartParts);
            }

            viewports.push(viewportData);
        }

        return {
            parts: allParts,
            viewports,
        };
    };

    private shouldUpdateMinMax = (allViewportData: TAllViewportData): boolean => {
        if (
            allViewportData.viewports.length === 0 ||
            allViewportData.viewports.every(({ parts }) => parts.length === 0)
        ) {
            return false;
        }

        return (
            this.isPositionChanged() ||
            this.isSettingsChanged() ||
            this.isPartsChanged(allViewportData.parts) ||
            this.isCurrentViewportChanged(allViewportData.viewports)
        );
    };

    private isPositionChanged(): boolean {
        const { prevLeftRight } = this.state;
        const { viewport } = this.ctx;
        const left = viewport.getLeft();
        const right = viewport.getRight();

        const dLeft = Math.abs(prevLeftRight[0] - left);
        const dRight = Math.abs(prevLeftRight[1] - right);
        const changed = dLeft + dRight > 100 / viewport.scale.x;

        if (changed) {
            prevLeftRight[0] = left;
            prevLeftRight[1] = right;
        }

        return changed;
    }

    private isPartsChanged(parts: TPart[]): boolean {
        return this.partsChangeDetector(parts);
    }

    private isCurrentViewportChanged(viewportDataArray: TViewportData[]): boolean {
        return this.viewportChangeDetector(viewportDataArray);
    }

    private isSettingsChanged(): boolean {
        const state = getState(this.ctx);

        return this.settingsChangeDetector([
            state.minY,
            state.maxY,
            state.fixedMinY,
            state.fixedMaxY,
            state.minYRight,
            state.maxYRight,
            state.fixedMinYRight,
            state.fixedMaxYRight,
        ]);
    }

    private updateAllMinMax(viewportData: TViewportData[]): void {
        for (const { yAxis, parts, groupedParts } of viewportData) {
            this.updateMinMax(yAxis, parts, groupedParts);
        }
    }

    private updateMinMax(yAxis: EVirtualViewport, parts: TPart[], groupedParts: TPart[][]): void {
        const state = getState(this.ctx);
        const minmax =
            yAxis === EVirtualViewport.left
                ? this.computeMinMax(
                      this.state.minMax[yAxis],
                      state.minY,
                      state.maxY,
                      state.fixedMinY,
                      state.fixedMaxY,
                      parts,
                      groupedParts,
                      yAxis,
                  )
                : this.computeMinMax(
                      this.state.minMax[yAxis],
                      state.minYRight,
                      state.maxYRight,
                      state.fixedMinYRight,
                      state.fixedMaxYRight,
                      parts,
                      groupedParts,
                      yAxis,
                  );

        this.state.minMax[yAxis][0] = minmax[0];
        this.state.minMax[yAxis][1] = minmax[1];
    }

    private computeMinMax(
        currentMinMax: TMinMax,
        seedMin: undefined | number,
        seedMax: undefined | number,
        fixedMin: undefined | number,
        fixedMax: undefined | number,
        parts: TPart[],
        groupedParts: TPart[][],
        virtualViewport: EVirtualViewport,
    ): TMinMax {
        const fixedMinMax = getMinMaxPair(fixedMin, fixedMax);
        const partsMinMax =
            isNil(fixedMinMax[0]) || isNil(fixedMinMax[1])
                ? this.getPartsMinMax(parts)
                : fixedMinMax;
        const chartMinMax =
            isNil(fixedMinMax[0]) || isNil(fixedMinMax[1])
                ? this.getChartsMinMax(groupedParts)
                : fixedMinMax;

        const minFromPartAndChart = getMin(partsMinMax[0] ?? Infinity, chartMinMax[0] ?? Infinity);
        const maxFromPartAndChart = getMax(
            partsMinMax[1] ?? -Infinity,
            chartMinMax[1] ?? -Infinity,
        );

        let minmax = [
            fixedMinMax[0] !== undefined
                ? fixedMinMax[0]
                : isFinite(minFromPartAndChart)
                  ? getNearestFromRange(minFromPartAndChart, seedMin, seedMax)
                  : seedMin,
            fixedMinMax[1] !== undefined
                ? fixedMinMax[1]
                : isFinite(maxFromPartAndChart)
                  ? getNearestFromRange(maxFromPartAndChart, seedMin, seedMax)
                  : seedMax,
        ] as TMinMax;

        minmax = keepValidMinMax(currentMinMax, minmax);
        minmax = minMaxWithOptimalDiff(minmax);
        minmax = this.displayZeroController.modifyMinMax(virtualViewport, minmax);

        return minmax;
    }

    private getPartsMinMax(parts: TPart[]): TMinMax {
        const minmax = [Infinity, -Infinity] as TMinMax;

        if (parts.length === 0) return minmax;

        const state = getState(this.ctx);
        const viewport = this.ctx.viewport;
        const timeLeft = plus(state.clientTimeIncrement, viewport.getLeft());
        const timeRight = plus(state.clientTimeIncrement, viewport.getRight());

        for (const part of parts) {
            if (part.size === 0) continue;
            if (timeLeft > part.interval[1] || timeRight < part.interval[0]) {
                continue;
            }

            const partMinMax = getPartMinMax(
                part,
                minus(timeLeft, part.interval[0]),
                minus(timeRight, part.interval[0]),
            );

            minmax[0] = getMin(minmax[0], toAbsPointValue(part, partMinMax[0])!);
            minmax[1] = getMax(minmax[1], toAbsPointValue(part, partMinMax[1])!);
        }

        return minmax;
    }

    private getChartsMinMax(groupedParts: TPart[][]): TPartialMinMax {
        let min = Infinity;
        let max = -Infinity;

        for (const group of groupedParts) {
            const currentMinMax = this.getChartMinMax(group);

            min = getMin(min, currentMinMax[0] ?? Infinity);
            max = getMax(max, currentMinMax[1] ?? -Infinity);
        }

        return [min, max];
    }

    private getChartMinMax(parts: TPart[]): TPartialMinMax {
        const minmax = [Infinity, -Infinity] as TMinMax;

        if (parts.length === 0) return minmax;

        const chart = this.ctx.chartsController.getChartProps(parts[0].seriesId);

        if (chart === undefined) return minmax;

        const state = getState(this.ctx);
        const viewport = this.ctx.viewport;
        const timeLeft = plus(state.clientTimeIncrement, viewport.getLeft());
        const timeRight = plus(state.clientTimeIncrement, viewport.getRight());

        const closestAbsLeftValue = shouldConsiderLeftPoint(chart.type)
            ? getClosestAbsLeftValue(parts, timeLeft)
            : undefined;
        const closestAbsRightValue = shouldConsiderRightPoint(chart.type)
            ? getClosestAbsRightValue(parts, timeRight)
            : undefined;

        minmax[0] = getMin(
            minmax[0],
            getMin(closestAbsLeftValue ?? Infinity, closestAbsRightValue ?? Infinity),
        );

        minmax[1] = getMax(
            minmax[1],
            getMax(closestAbsLeftValue ?? -Infinity, closestAbsRightValue ?? -Infinity),
        );

        return minmax;
    }
}
