// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />

import type { Someseconds } from '@common/types';
import type { Container, Shader } from 'pixi.js';

import type { TSeriesId } from '../lib/Parts/def';
import type { ISharedRenderer } from '../lib/SharedRendered';
import type { IChartViewport } from './components/ChartViewport/defs';
import type { TChartLevel } from './components/Grid/defs';
import type { ChartsController, TChartProps } from './services/ChartsController';
import type { DebugController } from './services/DebugController';
import type { IFocusController } from './services/FocusController';
import type { IFontController } from './services/FontController';
import type { GridMeasuresController } from './services/GridMeasuresController';
import type { MinMaxController } from './services/MinMaxController';
import type { MouseClosestPointsController } from './services/MouseClosestPointsController';
import type { MouseController } from './services/MouseController';
import type { PartsController } from './services/PartsController';
import type { PartsCoordsController } from './services/PartsCoordsController';
import type {
    PartsLoader,
    TRequestClosestPoints,
    TRequestPartsItems,
} from './services/PartsLoader';
import type { IRenderController } from './services/RenderController';
import type { SizeController } from './services/SizeController';
import type { TickerController } from './services/TickerController';
import type { TimeZoneController } from './services/TimeZoneController';
import type { ViewportController } from './services/ViewportController';
import type { VirtualViewportController } from './services/VirtualViewportController';

export interface IContext extends IControllers {
    targetView: HTMLCanvasElement;
    targetContext: CanvasRenderingContext2D;
    sharedRenderer: ISharedRenderer;

    state: TContextState;
}

export type TContextState = {
    graphicsGap: TGap;

    charts?: TChartProps[];
    levels?: TChartLevel[];

    minY?: number;
    maxY?: number;
    fixedMinY?: number;
    fixedMaxY?: number;

    minYRight?: number;
    maxYRight?: number;
    fixedMinYRight?: number;
    fixedMaxYRight?: number;

    minWidth?: Someseconds;
    maxWidth?: Someseconds;
    pixelSizes: Someseconds[];
    requestedPixelsCount: number;

    resolution: number;
    screenWidth?: number;
    screenHeight?: number;
    worldWidth?: number | null;
    worldHeight?: number | null;

    timeZone: Someseconds;
    timeNowIncrements: Record<TSeriesId, Someseconds>;

    serverTimeIncrement: Someseconds;
    clientTimeIncrement: Someseconds;

    somesecondsToMillisecondsRatio: number;
    millisecondsToSomesecondsRatio: number;

    enableClosestPoints?: boolean;
    enableDebug?: boolean;

    maxPartSize: number;
    maxChartsCount: number;
    maxChartPartsCount: number;

    showPseudoHorizontalCrosshair: boolean;
    showPseudoHorizontalCrosshairTooltips: boolean;

    __states__: Record<string, undefined | object>;
};

interface IControllers {
    stage: Container;
    viewport: IChartViewport;
    debugController: DebugController;
    focusController: IFocusController;
    tickerController: TickerController;
    mouseController: MouseController;
    sizeController: SizeController;
    fontController: IFontController;
    viewportController: ViewportController;
    chartsController: ChartsController;
    partsController: PartsController;
    partsCoordsController: PartsCoordsController;
    minMaxController: MinMaxController;
    virtualViewportController: VirtualViewportController;
    gridMeasuresController: GridMeasuresController;
    timeZoneController: TimeZoneController;
    renderController: IRenderController;

    partsLoader: PartsLoader;
    mouseClosestPointsController?: MouseClosestPointsController;

    sharedShader: { chartParts: Shader };
}

export type TGap = {
    t: number;
    r: number;
    b: number;
    l: number;
};

export type TTimeseriesCharterOptions = Partial<TContextState>;

export type TTimeseriesCharterDeps = {
    requestPartsItems?: TRequestPartsItems;
    requestClosestPoints?: TRequestClosestPoints;
};
