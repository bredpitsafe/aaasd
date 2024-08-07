import { red } from '@frontend/common/src/utils/colors';
import type { Renderer } from 'pixi.js';
import { Graphics, utils } from 'pixi.js';

import type { TPartInterval } from '../../../lib/Parts/def';
import { getState } from '../../Charter/methods';
import type { IContext } from '../../types';

const COLOR = utils.string2hex(red[5]);
const HEIGHT = 4;

export class ChartFailedParts extends Graphics {
    constructor(public ctx: IContext) {
        super();

        this.beginFill(COLOR, 1);
        this.drawRect(0, 0, 1, HEIGHT);
        this.endFill();
    }

    render(renderer: Renderer): void {
        const intervals = this.ctx.partsController.getAllFailedIntervals();

        if (intervals && intervals.length > 0) {
            this.renderLine(intervals);
            super.render(renderer);
        }
    }

    private renderLine(intervals: TPartInterval[]): void {
        const { viewport } = this.ctx;
        const { graphicsGap, clientTimeIncrement } = getState(this.ctx);

        const minTimeX = intervals.reduce(reduceMinTime, Infinity);
        const maxTimeX = intervals.reduce(reduceMaxTime, -Infinity);
        const canvasX = Math.max(
            graphicsGap.l,
            (minTimeX - clientTimeIncrement - viewport.getLeft()) * viewport.scale.x,
        );
        const canvasWidth = Math.min(
            viewport.screenWidth - graphicsGap.l - graphicsGap.r,
            (maxTimeX - minTimeX) * viewport.scale.x,
        );

        this.x = canvasX;
        this.y = viewport.screenHeight - graphicsGap.b - HEIGHT;
        this.scale.x = canvasWidth;
    }
}

const reduceMinTime = (min: number, int: [number, number]) => Math.min(min, int[0]);
const reduceMaxTime = (min: number, int: [number, number]) => Math.max(min, int[1]);
