import { ArrowDiffer } from '@frontend/common/src/utils/ArrowDiffer';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { ReplaySubject, Subject } from 'rxjs';

import type { TSeriesId } from '../../lib/Parts/def';
import { createLocalState } from '../Charter/methods';
import type { TChartProps as TChartPropsView } from '../components/Chart/defs';
import type { EVirtualViewport } from '../components/ChartViewport/defs';
import type { IContext } from '../types';

export type TChartProps = Omit<TChartPropsView, 'ctx'> & {
    visible: boolean;
};

const extractChartId = (c: TChartProps) => c.id;
const selectVisible = (c: TChartProps) => c.visible;

export class ChartsController {
    public update$ = new ReplaySubject<TChartProps[]>(1);
    public deleteChartId$ = new Subject<TSeriesId>();

    private state: {
        charts: TChartProps[];
    };
    private differ = new ArrowDiffer((props: TChartProps) => props.id);
    private mapSeriesIdToChartProps = new Map<TSeriesId, TChartProps>();

    constructor(
        private ctx: IContext,
        chartProps: TChartProps[],
    ) {
        this.state = createLocalState(
            ctx,
            'ChartsController',
            (state) =>
                state ?? {
                    charts: chartProps,
                },
        );

        this.update$.subscribe((charts) => {
            const { added, updated, deleted } = this.differ.nextState(charts);

            added.forEach(this.addChart);
            updated.forEach(this.updateChart);
            deleted.forEach(this.deleteChart);

            this.state.charts = charts;
        });

        this.setCharts(this.state.charts);
    }

    destroy(): void {
        for (const key of this.mapSeriesIdToChartProps.keys()) {
            this.deleteChartId$.next(key);
        }

        this.mapSeriesIdToChartProps.clear();
    }

    getChartProps(id: TSeriesId): void | TChartProps {
        return this.mapSeriesIdToChartProps.get(id);
    }

    setCharts(nextChartProps: TChartProps[]): void {
        this.update$.next(nextChartProps);
    }

    deleteCharts(): void {
        this.update$.next(EMPTY_ARRAY);
    }

    getVisibleChartsIds(): TSeriesId[] {
        return this.getVisibleChartsProps().map(extractChartId);
    }

    getVisibleChartsProps(): TChartProps[] {
        return this.state.charts.filter(selectVisible);
    }

    hasChartsOnAxis(axis: EVirtualViewport): boolean {
        return this.getVisibleChartsProps().some((chart) => chart.yAxis === axis);
    }

    private addChart = (chartProps: TChartProps): void => {
        if (!this.mapSeriesIdToChartProps.has(chartProps.id)) {
            this.mapSeriesIdToChartProps.set(chartProps.id, chartProps);
            this.ctx.partsController.addPartsStore(chartProps.id);
        }
    };

    private updateChart = (chartProps: TChartProps): void => {
        this.mapSeriesIdToChartProps.set(chartProps.id, chartProps);
    };

    private deleteChart = (chartProps: TChartProps): void => {
        if (this.mapSeriesIdToChartProps.has(chartProps.id)) {
            this.mapSeriesIdToChartProps.delete(chartProps.id);
            this.ctx.partsController.deletePartsStore(chartProps.id);
            this.deleteChartId$.next(chartProps.id);
        }
    };
}
