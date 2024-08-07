import type { TPoint } from '@frontend/common/src/types/shape';
import { ObservablePoint } from '@pixi/math';
import { noop } from 'lodash-es';

import { createLocalState } from '../../Charter/methods';
import type { EVirtualViewport } from '../../components/ChartViewport/defs';
import type { IContext } from '../../types';

export class VirtualViewport {
    private readonly state = {
        virtualScale: 1,
        virtualOffset: 0,
        roundFactor: 0,
    };
    private readonly _scale: ObservablePoint;

    constructor(
        private ctx: IContext,
        public yAxis: EVirtualViewport,
    ) {
        this.state = createLocalState(
            ctx,
            'VirtualViewport_' + yAxis,
            (state) => state ?? this.state,
        );
        this._scale = new ObservablePoint(noop, ctx.viewport.scale.x, ctx.viewport.scale.y);
    }

    public setVirtualParameters(
        sourceMin: number,
        sourceMax: number,
        destinationMin: number,
        destinationMax: number,
    ): VirtualViewport {
        const { state } = this;
        const deltaDestination = Math.abs(destinationMax - destinationMin);
        const deltaSource = Math.abs(sourceMax - sourceMin);
        const scale = deltaDestination / deltaSource;
        const offset = destinationMin - sourceMin * scale;

        state.virtualScale = scale;
        state.virtualOffset = offset;

        const roundLogFactor = 2;
        const logFactor = Math.log10(deltaSource);
        state.roundFactor = Math.floor(logFactor) - roundLogFactor;

        return this;
    }

    public reset(): VirtualViewport {
        this.state.virtualScale = 1;
        this.state.virtualOffset = 0;
        this.state.roundFactor = 0;

        return this;
    }

    public get scale(): ObservablePoint {
        this._scale.set(this.scaleX, this.scaleY);
        return this._scale;
    }

    public get scaleX(): number {
        return this.ctx.viewport.scale.x;
    }

    public get scaleY(): number {
        return this.ctx.viewport.scale.y * this.state.virtualScale;
    }

    public get x(): number {
        return this.ctx.viewport.x;
    }

    public get y(): number {
        return this.ctx.viewport.y - this.state.virtualOffset * this.ctx.viewport.scale.y;
    }

    public get absLeft(): number {
        return this.ctx.state.clientTimeIncrement + this.ctx.viewport.getLeft();
    }

    public get absTop(): number {
        return this.toVirtualViewportY(-this.ctx.viewport.getTop());
    }

    public toViewportPoint(point: TPoint): TPoint {
        return {
            x: (point.x - this.absLeft) * this.ctx.viewport.scale.x,
            y:
                -(
                    point.y * this.state.virtualScale +
                    this.state.virtualOffset +
                    this.ctx.viewport.getTop()
                ) * this.ctx.viewport.scale.y,
        };
    }

    public toVirtualViewportYAxis(value: number): string {
        if (this.state.virtualScale === 1) {
            return String(value);
        }

        const result = this.toVirtualViewportY(value);

        if (Number.isNaN(result)) {
            return String(value);
        }

        const roundMultiplier = 10 ** this.state.roundFactor;
        const displayValue =
            this.state.roundFactor <= 0
                ? result.toFixed(-this.state.roundFactor)
                : result <= roundMultiplier
                  ? result.toFixed(0)
                  : (Math.round(result / roundMultiplier) * roundMultiplier).toFixed(0);

        return displayValue === '-0' ? '0' : displayValue;
    }

    public toVirtualViewportY(value: number): number {
        return (value - this.state.virtualOffset) / this.state.virtualScale;
    }

    public toCanvasPoint = (point: TPoint): TPoint => {
        return {
            x: this.toCanvasX(point.x),
            y: this.toCanvasY(point.y),
        };
    };

    public toCanvasX = (value: number): number => {
        return (value - this.absLeft) * this.scaleX + this.ctx.state.graphicsGap.l;
    };

    public toCanvasY = (value: number): number => {
        return (this.absTop - value) * this.scaleY + this.ctx.state.graphicsGap.t;
    };

    public getHash(): number {
        return this.state.virtualScale + this.state.virtualOffset;
    }
}
