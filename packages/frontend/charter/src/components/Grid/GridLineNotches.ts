import { Graphics } from 'pixi.js';

import { getState } from '../../Charter/methods';
import type { IContext } from '../../types';
import { EVirtualViewport } from '../ChartViewport/defs';
import {
    DefaultAltColorLines,
    DefaultColorLines,
    LINE_WIDTH,
    NOTCH_X_WIDTH,
    NOTCH_Y_WIDTH,
} from './defs';

export class GridLineNotches extends Graphics {
    constructor(
        private ctx: IContext,
        private colorLines = DefaultColorLines,
        private altColorLines = DefaultAltColorLines,
    ) {
        super();
    }

    updateTransform(): void {
        const { gridMeasuresController, virtualViewportController } = this.ctx;
        const { screenWidth, screenHeight } = this.ctx.viewport;
        const { graphicsGap } = getState(this.ctx);
        const measures = gridMeasuresController.getMeasures();

        const leftVisible = virtualViewportController.isVirtualViewportVisible(
            EVirtualViewport.left,
        );
        const rightVisible = virtualViewportController.isVirtualViewportVisible(
            EVirtualViewport.right,
        );

        const { xAxisNotches, yAxisNotches } = measures;

        let index = 0;

        for (const { x } of xAxisNotches) {
            const g = this.getGraphics(index++);

            g.x = x;
            g.y = screenHeight - graphicsGap.b - NOTCH_X_WIDTH;
            g.scale.x = 1;
            g.scale.y = NOTCH_X_WIDTH;
            g.tint = this.colorLines;
            g.visible = true;
        }

        if (leftVisible) {
            for (const { y } of yAxisNotches) {
                const g = this.getGraphics(index++);

                g.x = graphicsGap.l;
                g.y = y;
                g.scale.x = NOTCH_Y_WIDTH;
                g.scale.y = 1;
                g.tint = this.colorLines;
                g.visible = true;
            }
        }

        if (rightVisible) {
            this.lineStyle(LINE_WIDTH, this.altColorLines, 1);

            const rightEdge = screenWidth - graphicsGap.r - NOTCH_Y_WIDTH;

            for (const { y } of yAxisNotches) {
                const g = this.getGraphics(index++);

                g.x = rightEdge;
                g.y = y;
                g.scale.x = NOTCH_Y_WIDTH;
                g.scale.y = 1;
                g.tint = this.altColorLines;
                g.visible = true;
            }
        }

        for (; index < this.children.length; index++) {
            this.children[index].visible = false;
        }

        super.updateTransform();
    }

    private getGraphics(index: number): Graphics {
        return (this.children[index] ?? this.addChild(createGraphics())) as Graphics;
    }
}

function createGraphics(g = new Graphics()): Graphics {
    g.beginFill(0xffffff, 1);
    g.drawRect(0, 0, LINE_WIDTH, LINE_WIDTH);
    g.endFill();
    return g;
}
