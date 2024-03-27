import { Container, Graphics } from 'pixi.js';

import { getState } from '../../Charter/methods';
import type { IContext } from '../../types';
import { LINE_WIDTH } from './defs';

export class GridLines extends Container {
    constructor(private ctx: IContext) {
        super();
    }

    updateTransform(): void {
        const measures = this.ctx.gridMeasuresController.getMeasures();
        const { scale, screenWidth, screenHeight } = this.ctx.viewport;
        const { graphicsGap } = getState(this.ctx);
        const { xAxisTicks, yAxisTicks, viewportLeft, viewportTop } = measures;
        let index = 0;

        for (const tick of xAxisTicks) {
            const g = this.getGraphics(index++);
            g.x = (tick - viewportLeft) * scale.x;
            g.y = graphicsGap.t;
            g.scale.x = 1;
            g.scale.y = screenHeight - graphicsGap.b;
            g.visible = true;
        }

        for (const tick of yAxisTicks) {
            const g = this.getGraphics(index++);
            g.x = graphicsGap.l;
            g.y = (tick - viewportTop) * scale.y;
            g.scale.x = screenWidth - graphicsGap.r;
            g.scale.y = 1;
            g.visible = true;
        }

        for (; index < this.children.length; index++) {
            this.children[index].visible = false;
        }

        super.updateTransform();
    }

    private getGraphics(index: number) {
        return this.children[index] ?? this.addChild(createGraphics());
    }
}

function createGraphics(g = new Graphics()): Graphics {
    g.beginFill(0xe5e5e5, 1);
    g.drawRect(0, 0, LINE_WIDTH, LINE_WIDTH);
    g.endFill();
    return g;
}
