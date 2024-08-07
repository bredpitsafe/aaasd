import { Graphics } from 'pixi.js';

import type { IContext } from '../../types';
import { EVirtualViewport } from '../ChartViewport/defs';
import { DefaultAltColorLines, DefaultColorLines, LINE_WIDTH } from './defs';

export class GridAxis extends Graphics {
    private graphicsX = new Graphics();
    private graphicsY = {
        [EVirtualViewport.left]: new Graphics(),
        [EVirtualViewport.right]: new Graphics(),
    };

    constructor(
        private ctx: IContext,
        private colorLines = DefaultColorLines,
        private altColorLines = DefaultAltColorLines,
    ) {
        super();

        this.addChild(
            drawInitRect(this.graphicsX, this.colorLines),
            drawInitRect(this.graphicsY[EVirtualViewport.left], this.colorLines),
            drawInitRect(this.graphicsY[EVirtualViewport.right], this.altColorLines),
        );
    }

    updateTransform(): void {
        const {
            state: { graphicsGap },
            viewport: { screenWidth, screenHeight },
        } = this.ctx;
        const vvController = this.ctx.virtualViewportController;
        const vvVisible = vvController.getVisibleVirtualViewportNames();

        this.graphicsY[EVirtualViewport.left].visible = vvVisible.includes(EVirtualViewport.left);

        this.graphicsY[EVirtualViewport.right].visible = vvVisible.includes(EVirtualViewport.right);

        for (const name of vvVisible) {
            const g = this.graphicsY[name];
            g.x =
                name === EVirtualViewport.left
                    ? graphicsGap.l - LINE_WIDTH
                    : screenWidth - graphicsGap.r - LINE_WIDTH;
            g.y = graphicsGap.t;
            g.scale.y = screenHeight - graphicsGap.b;
            g.visible = true;
        }

        this.graphicsX.x = graphicsGap.l - LINE_WIDTH;
        this.graphicsX.y = screenHeight - graphicsGap.b;
        this.graphicsX.scale.x = screenWidth - graphicsGap.r - LINE_WIDTH;

        super.updateTransform();
    }
}

function drawInitRect(g: Graphics, color: number): Graphics {
    g.beginFill(color, 1);
    g.drawRect(0, 0, LINE_WIDTH, LINE_WIDTH);
    g.endFill();
    return g;
}
