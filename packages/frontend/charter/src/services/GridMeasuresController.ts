import type { Milliseconds, Someseconds } from '@common/types';
import { numberTicks } from '@frontend/common/src/utils/axisTicks/numberTicks';
import { timeTicks } from '@frontend/common/src/utils/axisTicks/timeTicks';
import { fixedLengthNumber } from '@frontend/common/src/utils/fixedLengthNumber';

import {
    createLocalState,
    getState,
    getZonedTime,
    millisecondsToSomeseconds,
    somesecondsToMilliseconds,
} from '../Charter/methods';
import { EVirtualViewport } from '../components/ChartViewport/defs';
import type { IContext } from '../types';
import { computeSecondsAndSecondFractions } from '../utils/computeSecondsAndSecondFractions';
import { getTextMeasure } from '../utils/textMeasures';
import { getHumanUnixTimeOptions, humanUnixTimeGroup } from '../utils/time';

type TXNotch = {
    x: number;
    label: string;
    labelWidth: number;
};

type TYNotch = {
    y: number;
    leftLabel: undefined | string;
    leftLabelWidth: undefined | number;
    rightLabel: undefined | string;
    rightLabelWidth: undefined | number;
};

type TMeasures = {
    viewportLeft: number;
    viewportTop: number;

    xAxisTicks: Someseconds[];
    yAxisTicks: number[];

    xAxisNotches: TXNotch[];
    xFromTo: string[];
    yAxisNotches: TYNotch[];
};

const TEXT_MARGIN = 20;

export class GridMeasuresController {
    private readonly state: {
        measures: TMeasures;
    };

    constructor(private ctx: IContext) {
        this.state = createLocalState(
            ctx,
            'GridMeasuresController',
            (state) =>
                state ?? {
                    measures: {
                        viewportLeft: 0,
                        viewportTop: 0,
                        xAxisTicks: [],
                        yAxisTicks: [],
                        xAxisNotches: [],
                        xFromTo: [],
                        yAxisNotches: [],
                    },
                },
        );

        ctx.tickerController.add(this.update, this);
    }

    destroy(): void {
        this.ctx.tickerController.remove(this.update, this);
    }

    getMeasures(): TMeasures {
        return this.state.measures;
    }

    private update() {
        const { viewport } = this.ctx;
        const { measures } = this.state;
        const { graphicsGap } = getState(this.ctx);
        const left = viewport.getLeft();
        const top = viewport.getTop();

        const viewportLeft = Math.trunc(left + graphicsGap.l / viewport.scale.x);
        const viewportTop = top + graphicsGap.t / viewport.scale.y;

        const xAxisTicks = this.calculateXAxisTicks(viewportLeft);
        const yAxisTicks = this.calculateYAxisTicks(viewportTop);

        const { fromTo: xFromTo, notches: xAxisNotches } = this.createXAxisNotches(
            viewportLeft,
            xAxisTicks,
        );
        const yAxisNotches = this.createYAxisNotches(viewportTop, yAxisTicks);

        measures.viewportLeft = viewportLeft;
        measures.viewportTop = viewportTop;
        measures.xAxisTicks = xAxisTicks;
        measures.yAxisTicks = yAxisTicks;
        measures.xFromTo = xFromTo;
        measures.xAxisNotches = xAxisNotches;
        measures.yAxisNotches = yAxisNotches;
    }

    private calculateXAxisTicks(viewportLeft: number): Someseconds[] {
        const {
            state: { graphicsGap },
            viewport: { scale, screenWidth },
        } = this.ctx;

        const width = (screenWidth - graphicsGap.l - graphicsGap.r) / scale.x;
        const count = Math.trunc((screenWidth - graphicsGap.l - graphicsGap.r) / 100);
        return this.computeTicksX(viewportLeft, viewportLeft + width, count);
    }

    private calculateYAxisTicks(viewPortTop: number): number[] {
        const {
            state: { graphicsGap },
            viewport: { scale, screenHeight },
        } = this.ctx;

        const height = (screenHeight - graphicsGap.t - graphicsGap.b) / scale.y;
        const count = Math.max(2, Math.trunc((screenHeight - graphicsGap.t - graphicsGap.b) / 50));

        return GridMeasuresController.computeTicksY(viewPortTop, viewPortTop + height, count);
    }

    private createXAxisNotches(
        viewportLeft: number,
        xAxisTicks: Someseconds[],
    ): {
        fromTo: string[];
        notches: TXNotch[];
    } {
        const {
            viewport: { scale },
        } = this.ctx;

        const labels = this.formatLabelsX(xAxisTicks as Someseconds[]);
        const step = xAxisTicks[1] - xAxisTicks[0];
        const absoluteStepX = step * scale.x;
        let showEvenLabel = 0;

        const textsWidth: number[] = [];

        for (let index = 0; index < xAxisTicks.length; index++) {
            const str = labels.points[index];
            const textWidth = getTextMeasure(str).width;

            textsWidth.push(textWidth);
            showEvenLabel = Math.max(
                showEvenLabel,
                Math.ceil((textWidth + TEXT_MARGIN) / absoluteStepX),
            );
        }

        const suitableRemainder = computeRemainder(viewportLeft, step, showEvenLabel);

        const notches = xAxisTicks
            .map((tick, index) => ({
                x: (tick - viewportLeft) * scale.x,
                label: labels.points[index],
                labelWidth: textsWidth[index],
            }))
            .filter((_, index) => index % showEvenLabel === suitableRemainder);

        return { fromTo: labels.fromTo, notches };
    }

    private createYAxisNotches(viewPortTop: number, yAxisTicks: number[]): TYNotch[] {
        const { virtualViewportController, viewport, chartsController } = this.ctx;
        const leftVisible = virtualViewportController.isVirtualViewportVisible(
            EVirtualViewport.left,
        );
        const rightVisible = virtualViewportController.isVirtualViewportVisible(
            EVirtualViewport.right,
        );
        const hasChartsOnLeftAxis = chartsController.hasChartsOnAxis(EVirtualViewport.left);

        return yAxisTicks.map((tick): TYNotch => {
            let leftLabel;
            let leftLabelWidth;
            let rightLabel;
            let rightLabelWidth;

            if (leftVisible) {
                leftLabel = GridMeasuresController.formatLabelY(-tick);
                leftLabelWidth = getTextMeasure(leftLabel).width;
            }

            if (rightVisible) {
                if (hasChartsOnLeftAxis) {
                    const rightViewport = virtualViewportController.getVirtualViewport(
                        EVirtualViewport.right,
                    );

                    rightLabel = rightViewport.toVirtualViewportYAxis(-tick);
                } else {
                    rightLabel = GridMeasuresController.formatLabelY(-tick);
                }
                rightLabelWidth = getTextMeasure(rightLabel).width;
            }

            return {
                y: (tick - viewPortTop) * viewport.scale.y,
                leftLabel,
                leftLabelWidth,
                rightLabel,
                rightLabelWidth,
            };
        });
    }

    private computeTicksX(start: number, stop: number, count: number): Someseconds[] {
        return timeTicks(
            somesecondsToMilliseconds(this.ctx.state, start as Someseconds),
            somesecondsToMilliseconds(this.ctx.state, stop as Someseconds),
            count,
        ).map((v) => millisecondsToSomeseconds(this.ctx.state, v as Milliseconds));
    }

    private static computeTicksY(start: number, stop: number, count: number): number[] {
        return numberTicks(start, stop, count);
    }

    private static formatLabelY(value: number): string {
        return fixedLengthNumber(value, 20);
    }

    private formatLabelsX(values: Someseconds[]): {
        fromTo: string[];
        points: string[];
    } {
        const { state } = this.ctx;

        const labels = humanUnixTimeGroup(
            values.map((value) =>
                computeSecondsAndSecondFractions(
                    state,
                    getZonedTime(state, value),
                    state.clientTimeIncrement,
                    state.serverTimeIncrement,
                ),
            ),
            getHumanUnixTimeOptions(this.ctx),
        );

        const fromTo = labels.fromTo[0] === labels.fromTo[1] ? [labels.fromTo[0]] : labels.fromTo;

        return { ...labels, fromTo };
    }
}

function computeRemainder(left: number, step: number, even: number): number {
    const l = Math.floor(left);
    return even - 1 - Math.abs((l % (step * even)) - (l % step)) / step;
}
