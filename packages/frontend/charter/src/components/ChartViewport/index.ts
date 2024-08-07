import type { Nanoseconds } from '@common/types';
import type { Constructor } from '@common/types';
import type { TPoint } from '@frontend/common/src/types/shape';
import type { IDestroyOptions } from '@pixi/display';
import { Container } from '@pixi/display';
import { Point } from '@pixi/math';
import { defaults, isNil } from 'lodash-es';

import type { TScale } from '../../../lib/Parts/def';
import type {
    ICancellableViewportEvent,
    IChartViewport,
    TClampWidthOptions,
    TMeasureZoomHorizontalEvent,
    TMeasureZoomVerticalEvent,
    TViewportEvents,
    TViewportOptions,
    TViewportPlugins,
} from './defs';
import { ViewportEvent, ViewportEventNS } from './defs';

const DEFAULT_VIEWPORT_OPTIONS = {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: null,
    worldHeight: null,
} as const;

type TViewportProps = TViewportOptions &
    TViewportPlugins & {
        minWidth?: TScale;
        maxWidth?: TScale;
    };

export class ChartViewport extends Container implements IChartViewport {
    readonly options: TViewportProps;

    public screenWidth: number;
    public screenHeight: number;

    private worldWidth?: number | null;
    private worldHeight?: number | null;

    constructor(private readonly props: TViewportProps) {
        super();

        this.options = defaults({}, props, DEFAULT_VIEWPORT_OPTIONS);

        this.screenWidth = this.options.screenWidth!;
        this.screenHeight = this.options.screenHeight!;

        this.worldWidth = this.options.worldWidth;
        this.worldHeight = this.options.worldHeight;

        this.renderable = false;

        this.options.plugins?.forEach((plugin) => plugin.connect(this));
    }

    destroy(options?: IDestroyOptions | boolean) {
        this.options.plugins?.forEach((plugin) => plugin.destroy());
        this.options.plugins = undefined;
        super.destroy(options);
    }

    upsertClampOptions(options: TClampWidthOptions): void {
        Object.assign(this.options, options);
    }

    setViewportLeftRight(left: Nanoseconds, right: Nanoseconds, type = 'viewportLeftRight'): this {
        this.worldWidth = right - left;
        const scaleX = this.screenWidth / this.worldWidth;

        const zoomed = this.zoomHorizontal(scaleX);
        const moved = this.moveHorizontal(left);

        if (zoomed || moved) {
            this.emitEvent(ViewportEvent.MoveH, {
                viewport: this,
                type,
            });
        }

        return this;
    }

    setWorldWidth(worldWidth: Nanoseconds, type = 'worldWidth'): this {
        this.worldWidth = worldWidth;
        const scaleX = this.screenWidth / this.worldWidth;

        if (this.zoomHorizontal(scaleX)) {
            this.emitEvent(ViewportEvent.ZoomH, { viewport: this, type });
        }

        return this;
    }

    resize(
        screenWidth: number,
        screenHeight: number,
        worldWidth?: number,
        worldHeight?: number,
    ): this {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        if (!isNil(worldWidth)) {
            this.worldWidth = worldWidth;
        }
        if (!isNil(worldHeight)) {
            this.worldHeight = worldHeight;
        }

        this.emitEvent(ViewportEvent.Resize, { viewport: this });

        return this;
    }

    moveCenterX(value: number, type = 'moveCenterX'): this {
        return this.moveLeft(value - this.getWorldScreenWidth() / 2, type);
    }

    moveLeft(left: number, type = 'moveLeft'): this {
        if (this.moveHorizontal(left)) {
            this.emitEvent(ViewportEvent.MoveH, {
                viewport: this,
                type,
            });
        }
        return this;
    }

    moveTop(top: number, type = 'moveTop'): this {
        if (this.moveVertical(top)) {
            this.emitEvent(ViewportEvent.MoveV, {
                viewport: this,
                type,
            });
        }
        return this;
    }

    move(left: number, top: number, type = 'move'): this {
        this.moveLeft(left, type);
        this.moveTop(top, type);
        return this;
    }

    setScaleX(scale: number, point: TPoint, type = 'setScaleCenterX') {
        if (this.zoomHorizontal(scale, point)) {
            this.emitEvent(ViewportEvent.ZoomH, { viewport: this, type });
        }

        return this;
    }

    setScaleY(scale: number, point: TPoint, type = 'setScaleCenterY'): this {
        if (this.zoomVertical(scale, point)) {
            this.emitEvent(ViewportEvent.ZoomV, { viewport: this, type });
        }

        return this;
    }

    setScaleCenterX(scale: number, type = 'setScaleX'): this {
        if (this.zoomHorizontal(scale)) {
            this.emitEvent(ViewportEvent.ZoomH, { viewport: this, type });
        }

        return this;
    }

    setScaleCenterY(scale: number, type = 'setScaleY'): this {
        if (this.zoomVertical(scale)) {
            this.emitEvent(ViewportEvent.ZoomV, { viewport: this, type });
        }

        return this;
    }

    /** Search for plugin by its type */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findPlugin<T extends Constructor>(proto: T): InstanceType<T> | undefined {
        return this.options.plugins?.find((plugin) => plugin instanceof proto) as
            | InstanceType<T>
            | undefined;
    }

    getWorldScreenWidth(): number {
        return this.screenWidth / this.scale.x;
    }

    getWorldScreenHeight(): number {
        return this.screenHeight / this.scale.y;
    }

    getRight(): number {
        return -this.x / this.scale.x + this.getWorldScreenWidth();
    }
    setRight(value: number) {
        if (this.moveHorizontal(value, true)) {
            this.emitEvent(ViewportEvent.MoveH, { viewport: this });
        }
    }

    getLeft(): number {
        return -this.x / this.scale.x;
    }
    setLeft(value: number) {
        if (this.moveHorizontal(value)) {
            this.emitEvent(ViewportEvent.MoveH, { viewport: this });
        }
    }

    getTop(): number {
        return -this.y / this.scale.y;
    }
    setTop(value: number) {
        if (this.moveVertical(value)) {
            this.emitEvent(ViewportEvent.MoveV, { viewport: this });
        }
    }

    getBottom(): number {
        return -this.y / this.scale.y + this.getWorldScreenHeight();
    }
    setBottom(value: number) {
        if (this.moveVertical(value, true)) {
            this.emitEvent(ViewportEvent.MoveV, { viewport: this });
        }
    }

    getCenter(): Point {
        return new Point(
            this.getWorldScreenWidth() / 2 - this.x / this.scale.x,
            this.getWorldScreenHeight() / 2 - this.y / this.scale.y,
        );
    }

    getScreenWidthInWorldPixels(): number {
        return this.screenWidth / this.scale.x;
    }

    getMinScaleX(): number | null {
        return getScale(this.screenWidth, this.options.maxWorldWidth);
    }

    getMaxScaleX(): number | null {
        return getScale(this.screenWidth, this.options.minWorldWidth);
    }

    getMinScaleY(): number | null {
        return getScale(this.screenHeight, this.options.maxWorldHeight);
    }

    getMaxScaleY(): number | null {
        return getScale(this.screenHeight, this.options.minWorldHeight);
    }

    private zoomHorizontal(scale: number, zoomPoint: TPoint = this.getCenter()): boolean {
        const minScaleX = this.getMinScaleX();
        const maxScaleX = this.getMaxScaleX();

        if (!isNil(minScaleX) && scale < minScaleX) {
            scale = minScaleX;
        }

        if (!isNil(maxScaleX) && scale > maxScaleX) {
            scale = maxScaleX;
        }

        const originalScaleX = this.scale.x;

        if (scale === originalScaleX) {
            return false;
        }

        const event: TMeasureZoomHorizontalEvent = {
            viewport: this,
            type: 'Horizontal',
            cancelled: false,

            scale,
            zoomPoint,

            minScaleX: this.getMinScaleX(),
            maxScaleX: this.getMaxScaleX(),

            preventDefault: () => preventDefault.call(event),
        };

        this.emitEvent(ViewportEvent.TryZoomH, event);

        if (!event.cancelled) {
            const globalZoomPoint = this.toGlobal(zoomPoint);
            this.scale.x = scale;
            const newGlobalPoint = this.toGlobal(zoomPoint);
            this.x += globalZoomPoint.x - newGlobalPoint.x;
        }

        return !event.cancelled;
    }

    private zoomVertical(scale: number, zoomPoint: TPoint = this.getCenter()): boolean {
        const minScaleY = this.getMinScaleY();
        const maxScaleY = this.getMaxScaleY();

        if (!isNil(minScaleY) && scale < minScaleY) {
            scale = minScaleY;
        }

        if (!isNil(maxScaleY) && scale > maxScaleY) {
            scale = maxScaleY;
        }

        const originalScaleY = this.scale.y;

        if (scale === originalScaleY) {
            return false;
        }

        const event: TMeasureZoomVerticalEvent = {
            viewport: this,
            type: 'Vertical',
            cancelled: false,

            scale,
            zoomPoint,

            minScaleY: this.getMinScaleY(),
            maxScaleY: this.getMaxScaleY(),

            preventDefault: () => preventDefault.call(event),
        };

        this.emitEvent(ViewportEvent.TryZoomV, event);

        if (!event.cancelled) {
            const globalZoomPoint = this.toGlobal(zoomPoint);
            this.scale.y = scale;
            const newGlobalPoint = this.toGlobal(zoomPoint);
            this.y += globalZoomPoint.y - newGlobalPoint.y;
        }

        return !event.cancelled;
    }

    private moveHorizontal(value: number, right = false): boolean {
        const originalLeft = this.getLeft();

        if (value === originalLeft) {
            return false;
        }

        this.x = -value * this.scale.x + (right ? this.screenWidth : 0);

        return originalLeft !== this.getLeft();
    }

    private moveVertical(value: number, bottom = false): boolean {
        const originalTop = this.getTop();

        if (value === originalTop) {
            return false;
        }

        this.y = -value * this.scale.y + (bottom ? this.screenHeight : 0);

        return originalTop !== this.getTop();
    }

    private emitEvent<K extends keyof TViewportEvents>(type: K, event: TViewportEvents[K][0]) {
        // @ts-ignore
        this.emit(type, event);

        if (event === undefined) return;

        if ('cancelled' in event && event.cancelled) return;

        switch (type) {
            case ViewportEvent.MoveH:
            case ViewportEvent.MoveV: {
                this.emit(ViewportEventNS.ApplyMove, event);
                break;
            }
            case ViewportEvent.ZoomH:
            case ViewportEvent.ZoomV: {
                this.emit(ViewportEventNS.ApplyZoom, event);
                break;
            }
        }
    }
}

function getScale(screenDimension: number, worldDimension?: number): number | null {
    return worldDimension ? screenDimension / worldDimension : null;
}

function preventDefault(this: ICancellableViewportEvent) {
    const writableEvent = this as {
        -readonly [P in keyof typeof this]: (typeof this)[P];
    };

    writableEvent.cancelled = true;
}
