import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import type { Renderer } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';

import type { IContext } from '../../types';
import type { TChartLevel, TChartLevelLine } from '../Grid/defs';

export class Levels extends Container {
    constructor(private ctx: IContext) {
        super();
    }

    render(renderer: Renderer) {
        const levels = this.ctx.state.levels ?? EMPTY_ARRAY;
        let index = 0;

        for (; index < levels.length; index++) {
            this.renderLevel(levels[index], this.getGraphics(index));
        }

        for (; index < this.children.length; index++) {
            this.children[index].visible = false;
        }

        super.render(renderer);
    }

    private renderLevel(level: TChartLevel, graphics: Graphics): void {
        const virtualViewportController = this.ctx.virtualViewportController;

        graphics.visible = virtualViewportController.isVirtualViewportVisible(level.yAxis);

        if (graphics.visible) {
            const virtualViewport = virtualViewportController.getVirtualViewport(level.yAxis);

            graphics.tint = level.color;
            graphics.alpha = level.opacity;

            graphics.scale.y = isLineLevel(level)
                ? level.width
                : (level.top - level.bottom) * virtualViewport.scaleY;
            graphics.position.y = isLineLevel(level)
                ? virtualViewport.toCanvasY(level.value) - level.width / 2
                : virtualViewport.toCanvasY(level.top);
        }
    }

    private getGraphics(index: number): Graphics {
        return (this.children[index] ?? this.addChild(createGraphics())) as Graphics;
    }
}

function createGraphics(g = new Graphics()): Graphics {
    g.beginFill(0xffffff, 1);
    g.drawRect(0, 0, 9999, 1);
    g.endFill();
    return g;
}

function isLineLevel(level: TChartLevel): level is TChartLevelLine {
    return 'value' in level;
}
