import type { Constructor } from '@common/types';
import type { Nanoseconds } from '@common/types';
import type { TPoint } from '@frontend/common/src/types/shape';
import type { IDestroyOptions } from '@pixi/display';
import type { Point } from '@pixi/math';
import type { Container, IPointData } from 'pixi.js';

import type { IPlugin } from './plugins/defs';

export type TClampWidthOptions = {
    minWorldWidth?: number;
    maxWorldWidth?: number;
    minWorldHeight?: number;
    maxWorldHeight?: number;
};

export type TViewportOptions = TClampWidthOptions & {
    screenWidth?: number;
    screenHeight?: number;
    worldWidth?: number | null;
    worldHeight?: number | null;
};

export type TViewportPlugins = {
    plugins?: IPlugin[];
};

export interface IChartViewport extends Container {
    screenWidth: number;
    screenHeight: number;

    findPlugin<T extends Constructor>(proto: T): InstanceType<T> | undefined;

    destroy(options?: IDestroyOptions | boolean): void;

    upsertClampOptions(options: TClampWidthOptions): void;

    setViewportLeftRight(left: Nanoseconds, right: Nanoseconds, type?: string): this;

    resize(
        screenWidth: number,
        screenHeight: number,
        worldWidth?: number,
        worldHeight?: number,
    ): this;

    moveCenterX(value: number, type?: string): this;
    moveLeft(left: number, type?: string): this;
    moveTop(top: number, type?: string): this;
    move(left: number, top: number, type?: string): this;

    setScaleX(scale: number, point: TPoint, type?: string): this;
    setScaleY(scale: number, point: TPoint, type?: string): this;
    setScaleCenterX(scale: number, type?: string): this;
    setScaleCenterY(scale: number, type?: string): this;

    getRight(): number;
    setRight(value: number): void;
    getLeft(): number;
    setLeft(value: number): void;
    getTop(): number;
    setTop(value: number): void;
    getBottom(): number;
    setBottom(value: number): void;
    getCenter(): Point;
    getMinScaleX(): number | null;
    getMaxScaleX(): number | null;
    getMinScaleY(): number | null;
    getMaxScaleY(): number | null;
    setWorldWidth(worldWidth: Nanoseconds, type?: string): this;
    getWorldScreenWidth(): number;
    getWorldScreenHeight(): number;
    getScreenWidthInWorldPixels(): number;
}

export enum EVirtualViewport {
    left = 'left',
    right = 'right',
}

export enum ViewportEventNS {
    UserAction = 'user-action',

    MeasureMove = 'measure.move',
    MeasureZoom = 'measure.zoom',

    ApplyResize = 'apply.resize',
    ApplyMove = 'apply.move',
    ApplyZoom = 'apply.zoom',
}

export const ViewportEvent = <const>{
    Resize: ViewportEventNS.ApplyResize,

    MoveH: <const>`${ViewportEventNS.ApplyMove}.horizontal`,
    MoveV: <const>`${ViewportEventNS.ApplyMove}.vertical`,

    ZoomH: <const>`${ViewportEventNS.ApplyZoom}.horizontal`,
    ZoomV: <const>`${ViewportEventNS.ApplyZoom}.vertical`,

    TryZoomH: <const>`${ViewportEventNS.MeasureZoom}.horizontal`,
    TryZoomV: <const>`${ViewportEventNS.MeasureZoom}.vertical`,

    StartUserAction: <const>`${ViewportEventNS.UserAction}.start`,
    StopUserAction: <const>`${ViewportEventNS.UserAction}.stop`,
};

export type TViewportEvents = {
    [ViewportEventNS.ApplyMove]: [event: TBaseViewportEvent];
    [ViewportEventNS.ApplyZoom]: [event: TBaseViewportEvent];
    [ViewportEvent.Resize]: [event: TBaseViewportEvent];
    [ViewportEvent.MoveH]: [event: TBaseViewportEvent];
    [ViewportEvent.MoveV]: [event: TBaseViewportEvent];
    [ViewportEvent.ZoomH]: [event: TBaseViewportEvent];
    [ViewportEvent.ZoomV]: [event: TBaseViewportEvent];

    [ViewportEvent.TryZoomH]: [event: TMeasureZoomHorizontalEvent];
    [ViewportEvent.TryZoomV]: [event: TMeasureZoomVerticalEvent];
    [ViewportEvent.StartUserAction]: [];
    [ViewportEvent.StopUserAction]: [];
};

export type TBaseViewportEvent = {
    readonly viewport: IChartViewport;
    readonly type?: string;
};

export interface ICancellableViewportEvent {
    readonly cancelled: boolean;
    preventDefault(): void;
}

export type TMeasureZoomHorizontalEvent = TBaseViewportEvent &
    ICancellableViewportEvent & {
        readonly type: 'Horizontal';
        readonly scale: number;
        readonly zoomPoint: IPointData;
        readonly minScaleX: number | null;
        readonly maxScaleX: number | null;
    };

export type TMeasureZoomVerticalEvent = TBaseViewportEvent &
    ICancellableViewportEvent & {
        readonly type: 'Vertical';
        readonly scale: number;
        readonly zoomPoint: IPointData;
        minScaleY: number | null;
        maxScaleY: number | null;
    };
