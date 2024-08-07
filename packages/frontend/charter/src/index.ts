import '@frontend/common/src/utils/Rx/internalProviders';

import type { Nanoseconds, Someseconds } from '@common/types';
import { minus, plus } from '@common/utils';
import type { TPoint } from '@frontend/common/src/types/shape';
import { EMPTY_OBJECT } from '@frontend/common/src/utils/const';

import type { TPart, TSeriesId } from '../lib/Parts/def';
import { createCharter } from './Charter';
import type { ICharter } from './Charter/def';
import {
    getState,
    getTimeNow,
    setClientTimeIncrement,
    toggleMouseClosestPoints,
} from './Charter/methods';
import type { IChartViewport } from './components/ChartViewport/defs';
import { EVirtualViewport } from './components/ChartViewport/defs';
import { WheelPlugin } from './components/ChartViewport/plugins/WheelPlugin';
import type { TChartLevel } from './components/Grid/defs';
import type { IPlugin } from './plugins/Plugin';
import type { TChartProps } from './services/ChartsController';
import type { TClosestPointCursorData } from './services/MouseClosestPointsController';
import { PluginsController } from './services/PluginsController';
import type { TContextState, TTimeseriesCharterDeps, TTimeseriesCharterOptions } from './types';

export class TimeseriesCharter {
    private charter: ICharter;
    private pluginsController = new PluginsController(this);

    constructor(
        options: TTimeseriesCharterOptions,
        deps: TTimeseriesCharterDeps & { plugins?: IPlugin[] } = EMPTY_OBJECT,
    ) {
        this.charter = createCharter(options, deps);

        deps.plugins?.forEach((plug) => {
            this.pluginsController.addPlugin(plug);
        });
    }

    getSnapshot(): TContextState {
        return structuredClone(this.charter.getState());
    }

    destroy(): void {
        this.pluginsController.destroy();
        this.charter.destroy();
    }

    getView(): HTMLElement {
        return this.charter.ctx.targetView;
    }

    getScreenSize(): { width: number; height: number } {
        const state = getState(this.charter.ctx);
        return { width: state.screenWidth ?? 0, height: state.screenHeight ?? 0 };
    }

    getViewport(): IChartViewport {
        return this.charter.ctx.viewport;
    }

    getClientTimeIncrement(): Someseconds {
        return getState(this.charter.ctx).clientTimeIncrement;
    }

    getServerTimeIncrement(): Someseconds {
        return getState(this.charter.ctx).serverTimeIncrement;
    }

    setClientTimeIncrement(v: Someseconds): void {
        setClientTimeIncrement(this.charter.ctx.state, v);
    }

    getPointUnderMouse(): TPoint {
        const { serverTimeIncrement } = getState(this.charter.ctx);
        const { mouseController, virtualViewportController } = this.charter.ctx;
        const point = mouseController.getChartMouseCoords(
            virtualViewportController.getVirtualViewport(EVirtualViewport.left),
        );

        return {
            x: serverTimeIncrement + point.x,
            y: point.y,
        };
    }

    getTimeNow(): Someseconds {
        return getTimeNow(this.charter.ctx.state);
    }

    getCenterX(): number {
        return this.charter.ctx.viewport.getCenter().x;
    }

    getLeft(): number {
        return this.charter.ctx.viewport.getLeft();
    }

    getRight(): number {
        return this.charter.ctx.viewport.getRight();
    }

    getScaleX(): number {
        return this.charter.ctx.viewport.scale.x;
    }

    setScaleX(v: number): void {
        this.charter.ctx.viewport.setScaleCenterX(v);
    }

    getScreenWidth(): number {
        return this.charter.ctx.viewport.getScreenWidthInWorldPixels();
    }

    getDebugState(): boolean {
        return this.charter.ctx.debugController.isEnabled();
    }

    setDebugState(state: boolean): void {
        state
            ? this.charter.ctx.debugController.enable()
            : this.charter.ctx.debugController.disable();
    }

    setMaxY(v?: number): void {
        getState(this.charter.ctx).maxY = v;
    }

    setMinY(v?: number): void {
        getState(this.charter.ctx).minY = v;
    }

    setFixedMaxY(v?: number): void {
        getState(this.charter.ctx).fixedMaxY = v;
    }

    setFixedMinY(v?: number): void {
        getState(this.charter.ctx).fixedMinY = v;
    }

    setMaxYRight(v?: number): void {
        getState(this.charter.ctx).maxYRight = v;
    }

    setMinYRight(v?: number): void {
        getState(this.charter.ctx).minYRight = v;
    }

    setFixedMaxYRight(v?: number): void {
        getState(this.charter.ctx).fixedMaxYRight = v;
    }

    setFixedMinYRight(v?: number): void {
        getState(this.charter.ctx).fixedMinYRight = v;
    }

    focusTo(x: Someseconds): void {
        const {
            viewport,
            state: { serverTimeIncrement, clientTimeIncrement },
        } = this.charter.ctx;

        viewport.moveCenterX(minus(x, serverTimeIncrement + clientTimeIncrement));
    }

    focusToWithShift(x: Someseconds, shift: number): void {
        const { viewport } = this.charter.ctx;

        const absShift = ((viewport.getRight() - viewport.getLeft()) * shift) as Someseconds;

        this.focusTo(plus(x, absShift));
    }

    setWorldWidth(worldWidth: Nanoseconds): void {
        this.charter.ctx.viewport.setWorldWidth(worldWidth);
    }

    setZoomStepMultiplier(multiplier: number): void {
        WheelPlugin.upsertOptions(this.getViewport(), { multiplier });
    }

    setMinWorldWidth(minWorldWidth?: number): void {
        this.charter.ctx.viewport.upsertClampOptions({ minWorldWidth });
    }

    setMaxWorldWidth(maxWorldWidth?: number): void {
        this.charter.ctx.viewport.upsertClampOptions({ maxWorldWidth });
    }

    getTimeZone(): Someseconds {
        return this.charter.ctx.timeZoneController.getTimeZone();
    }

    setTimeZone(v: Someseconds): void {
        this.charter.ctx.timeZoneController.setTimeZone(v);
    }

    setTimeNowIncrements(map: Record<TSeriesId, Someseconds>): void {
        getState(this.charter.ctx).timeNowIncrements = map;
    }

    addPlugin<P extends IPlugin>(plugin: P): void {
        this.pluginsController.addPlugin(plugin);
    }

    removePlugin<P extends IPlugin>(plugin: P): void {
        this.pluginsController.removePlugin(plugin);
    }

    removeAllPlugins(): void {
        this.pluginsController.removeAllPlugins();
    }

    getClosestPoints(): TClosestPointCursorData[] {
        const {
            mouseClosestPointsController,
            state: { serverTimeIncrement },
        } = this.charter.ctx;

        return (
            mouseClosestPointsController?.getClosestPoints().map((data) => ({
                ...data,
                nearestPoint: {
                    x: data.point.x + serverTimeIncrement,
                    y: data.point.y,
                },
                nearestNonNaNPoint:
                    data.nonNaNPoint === undefined
                        ? undefined
                        : {
                              x: data.nonNaNPoint.x + serverTimeIncrement,
                              y: data.nonNaNPoint.y,
                          },
            })) || []
        );
    }

    toggleMouseClosestPoints(state: boolean): void {
        toggleMouseClosestPoints(this.charter.ctx, state);
    }

    setCharts(charts: TChartProps[]): void {
        this.charter.ctx.chartsController.setCharts(charts);
    }

    setLevels(levels?: TChartLevel[]): void {
        getState(this.charter.ctx).levels = levels;
    }

    getMouseCoords(): TPoint {
        return this.charter.ctx.mouseController.getCanvasMouseCoords();
    }

    getPseudoMouseCoords(): TPoint {
        return this.charter.ctx.mouseController.getPseudoCanvasMouseCoords();
    }

    setPseudoMouseCoords(point: TPoint): void {
        this.charter.ctx.mouseController.setPseudoCanvasMouseCoords(point);
    }

    toggleDisplayZero(axis: EVirtualViewport, value?: boolean): boolean {
        return this.charter.ctx.minMaxController.toggleDisplayZero(axis, value);
    }

    hasChartsOnAxis(axis: EVirtualViewport): boolean {
        return this.charter.ctx.chartsController.hasChartsOnAxis(axis);
    }

    resetChartsData(): void {
        this.charter.ctx.partsController.clear();
    }

    setPseudoHorizontalCrosshairVisibility(showPseudoHorizontalCrosshair: boolean): void {
        getState(this.charter.ctx).showPseudoHorizontalCrosshair = showPseudoHorizontalCrosshair;
    }

    setChartsTooltipsVisibility(showPseudoHorizontalCrosshairTooltips: boolean): void {
        getState(this.charter.ctx).showPseudoHorizontalCrosshairTooltips =
            showPseudoHorizontalCrosshairTooltips;
    }

    // Advanced API, only for Plugins

    getAllVisibleParts(): TPart[] {
        return this.charter.ctx.partsController.getAllVisibleParts();
    }

    everyChartShowingLastLivePart(): boolean {
        // IND_VAL - Indicator that has at least one published value on timeline
        // IND_NO_VAL - Indicator that has no published value on timeline
        //
        //                    | History               | Live               | Future
        //  BT Run IND_VAL    | Resolved, size [0..N] | Live, size [0..N]  | Live, size [0]
        //  BT Run IND_NO_VAL | Resolved, size [0]    | Resolved, size [0] | Resolved, size [0]
        //  Online IND_VAL    | Resolved, size [0..N] | Live, size [0..N]  | Live, size [0]
        //  Online IND_NO_VAL | Resolved, size [0]    | Live, size [0]     | Live, size [0]

        return this.charter.ctx.partsController
            .getLastVisibleParts()
            .every(({ unresolved, size }) => unresolved === 'live' || size === 0);
    }

    getSharedCanvas(): HTMLCanvasElement {
        return this.charter.ctx.sharedRenderer.renderer.view as HTMLCanvasElement;
    }
}
