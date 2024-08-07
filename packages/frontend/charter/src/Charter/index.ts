import type { Someseconds } from '@common/types';
import { isFunction, isUndefined } from 'lodash-es';

import { createSharedRenderer } from '../../lib/SharedRendered';
import { BlendContainer } from '../components/BlendContainer';
import { ChartFailedParts } from '../components/ChartFailedParts';
import { ChartLoadableIntervals } from '../components/ChartLoadableParts';
import { getChartPartsShader } from '../components/ChartParts/shaders';
import { Charts } from '../components/Charts';
import { ChartViewport } from '../components/ChartViewport';
import { DragPlugin } from '../components/ChartViewport/plugins/DragPlugin';
import { LocalState } from '../components/ChartViewport/plugins/LocalState';
import { WheelPlugin } from '../components/ChartViewport/plugins/WheelPlugin';
import { GridAxis, GridAxisTexts, GridLineNotches, GridLines } from '../components/Grid';
import { Levels } from '../components/Instruments/Levels';
import { MouseCoords } from '../components/MouseCoords';
import { Stage } from '../components/Stage';
import { ChartsController } from '../services/ChartsController';
import { DebugController } from '../services/DebugController';
import { createFocusController } from '../services/FocusController';
import { createFontController } from '../services/FontController';
import { GridMeasuresController } from '../services/GridMeasuresController';
import { MinMaxController } from '../services/MinMaxController';
import { MouseController } from '../services/MouseController';
import { PartsController } from '../services/PartsController';
import { PartsCoordsController } from '../services/PartsCoordsController';
import { PartsLoader } from '../services/PartsLoader';
import { createRenderController } from '../services/RenderController';
import { SizeController } from '../services/SizeController';
import { TickerController } from '../services/TickerController';
import { TimeZoneController } from '../services/TimeZoneController';
import { ViewportController } from '../services/ViewportController';
import { VirtualViewportController } from '../services/VirtualViewportController';
import type {
    IContext,
    TContextState,
    TTimeseriesCharterDeps,
    TTimeseriesCharterOptions,
} from '../types';
import type { ICharter } from './def';
import {
    DEFAULT_GAP,
    DEFAULT_REQUESTED_PIXELS_COUNT,
    MAX_CHART_PARTS_COUNT,
    MAX_CHARTS_COUNT,
    MAX_PART_BUFFER_LENGTH,
} from './def';
import { getState, toggleMouseClosestPoints } from './methods';
import { getPixelSizes, settingPIXI } from './utils';

settingPIXI();

export function createCharter(
    options: TTimeseriesCharterOptions,
    deps: TTimeseriesCharterDeps,
): ICharter {
    const ctx = createContext(options, deps);

    initComponents(ctx);

    ctx.tickerController.startControlFPS();

    return {
        ctx,
        getState: () => getState(ctx),
        destroy: () => {
            // First we should destroy(stop) ticker, because it can prevent useless actions inside Charter
            ctx.tickerController.destroy();

            ctx.debugController.destroy();
            ctx.mouseController.destroy();
            ctx.minMaxController.destroy();
            ctx.mouseClosestPointsController?.destroy();
            ctx.chartsController.destroy();
            ctx.partsController.destroy();
            ctx.viewportController.destroy();
            ctx.virtualViewportController.destroy();
            ctx.sizeController.destroy();
            ctx.gridMeasuresController.destroy();
            ctx.timeZoneController.destroy();
            ctx.fontController.destroy();
            ctx.sharedShader.chartParts.destroy();

            ctx.stage.destroy({
                texture: true,
                children: true,
                baseTexture: true,
            });
        },
    };
}

function createContextState(options: TTimeseriesCharterOptions): TContextState {
    return {
        resolution: options.resolution ?? window.devicePixelRatio,

        graphicsGap: DEFAULT_GAP,

        levels: options.levels,
        charts: options.charts,

        minY: options.minY,
        maxY: options.maxY,
        fixedMinY: options.fixedMinY,
        fixedMaxY: options.fixedMaxY,

        minYRight: options.minYRight,
        maxYRight: options.maxYRight,
        fixedMinYRight: options.fixedMinYRight,
        fixedMaxYRight: options.fixedMaxYRight,

        minWidth: options.minWidth,
        maxWidth: options.maxWidth,

        pixelSizes: getPixelSizes(options.millisecondsToSomesecondsRatio ?? 1),
        requestedPixelsCount: options.requestedPixelsCount ?? DEFAULT_REQUESTED_PIXELS_COUNT,

        timeZone: options.timeZone ?? (0 as Someseconds),
        timeNowIncrements: {},

        serverTimeIncrement: options.serverTimeIncrement ?? (0 as Someseconds),
        clientTimeIncrement: options.clientTimeIncrement ?? (0 as Someseconds),

        somesecondsToMillisecondsRatio: options.somesecondsToMillisecondsRatio ?? 1,
        millisecondsToSomesecondsRatio: options.millisecondsToSomesecondsRatio ?? 1,

        maxPartSize: options.maxPartSize ?? MAX_PART_BUFFER_LENGTH,
        maxChartsCount: options.maxChartsCount ?? MAX_CHARTS_COUNT,
        maxChartPartsCount: options.maxChartPartsCount ?? MAX_CHART_PARTS_COUNT,

        enableDebug: options.enableDebug ?? false,
        enableClosestPoints: options.enableClosestPoints ?? false,

        showPseudoHorizontalCrosshair: options.showPseudoHorizontalCrosshair ?? false,

        showPseudoHorizontalCrosshairTooltips:
            options.showPseudoHorizontalCrosshairTooltips ?? false,

        __states__: options.__states__ ?? {},
    };
}

const sharedRenderer = createSharedRenderer({
    antialias: true,
    autoDensity: true,
    resolution: devicePixelRatio,
    backgroundColor: 0xffffff,
});

function createContext(options: TTimeseriesCharterOptions, deps: TTimeseriesCharterDeps): IContext {
    const ctx = { state: createContextState(options) } as IContext;
    const canvas = document.createElement('canvas');

    ctx.targetView = canvas;
    ctx.targetContext = canvas.getContext('2d')!;

    ctx.stage = new Stage();
    ctx.sharedRenderer = sharedRenderer;

    ctx.viewport = new ChartViewport({
        screenWidth: isUndefined(options.screenWidth) ? options.screenWidth : options.screenWidth,
        screenHeight: isUndefined(options.screenHeight)
            ? options.screenHeight
            : options.screenHeight,
        worldWidth: options.worldWidth,
        worldHeight: options.worldHeight,

        plugins: [
            new WheelPlugin(ctx.targetView, ctx.targetView, ctx.state.resolution),
            new DragPlugin(ctx.targetView),
            new LocalState(ctx),
        ],
    });

    ctx.viewport.upsertClampOptions({
        minWorldWidth: ctx.state.minWidth,
        maxWorldWidth: ctx.state.maxWidth,
    });

    ctx.focusController = createFocusController(ctx);
    ctx.tickerController = new TickerController(ctx);
    ctx.debugController = new DebugController(ctx);

    ctx.sizeController = new SizeController(ctx);
    ctx.fontController = createFontController();
    ctx.viewportController = new ViewportController(ctx);
    ctx.virtualViewportController = new VirtualViewportController(ctx);

    if (isFunction(deps.requestPartsItems) && isFunction(deps.requestClosestPoints)) {
        ctx.partsLoader = new PartsLoader({
            requestPartsItems: deps.requestPartsItems,
            requestClosestPoints: deps.requestClosestPoints,
        });
    }

    ctx.partsController = new PartsController(ctx);
    ctx.partsCoordsController = new PartsCoordsController(ctx);
    ctx.chartsController = new ChartsController(ctx, getState(ctx).charts ?? []);

    ctx.mouseController = new MouseController(ctx);
    ctx.minMaxController = new MinMaxController(ctx);
    ctx.gridMeasuresController = new GridMeasuresController(ctx);

    ctx.timeZoneController = new TimeZoneController(ctx);

    ctx.renderController = createRenderController(ctx);

    ctx.sharedShader = {
        chartParts: getChartPartsShader(),
    };

    return ctx;
}

function initComponents(ctx: IContext): void {
    const { stage, viewport } = ctx;

    stage.addChild(viewport!);
    stage.addChild(new BlendContainer());
    stage.addChild(new GridAxis(ctx));
    stage.addChild(new GridLines(ctx));
    stage.addChild(new ChartFailedParts(ctx));
    stage.addChild(new ChartLoadableIntervals(ctx));
    stage.addChild(new Levels(ctx));
    stage.addChild(new Charts({ ctx }));
    stage.addChild(new GridAxisTexts(ctx));
    stage.addChild(new GridLineNotches(ctx));

    if (getState(ctx).enableClosestPoints) {
        toggleMouseClosestPoints(ctx, true);
    }

    stage.addChild(new MouseCoords(ctx));
}
