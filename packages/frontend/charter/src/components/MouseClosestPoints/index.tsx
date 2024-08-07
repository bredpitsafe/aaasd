import { unpackRGBA } from '@frontend/common/src/utils/packRGBA';
import type { Renderer } from 'pixi.js';
import { Container, Graphics, utils } from 'pixi.js';

import type { TClosestPointCursorData } from '../../services/MouseClosestPointsController';
import type { IContext } from '../../types';

const POINT_RADIUS = 4;

export class MouseClosestPoints extends Container {
    constructor(public ctx: IContext) {
        super();
    }

    render(renderer: Renderer): void {
        const closestPoints = this.ctx.mouseClosestPointsController?.getClosestPoints();

        if (closestPoints && closestPoints.length > 0) {
            this.renderPoints(closestPoints);
            super.render(renderer);
        }
    }

    private renderPoints(pointsData: TClosestPointCursorData[]): void {
        const { chartsController, virtualViewportController: vvController } = this.ctx;

        let index = 0;

        for (const { id, point, nonNaNPoint } of pointsData) {
            const chart = chartsController.getChartProps(id)!;
            const renderPoint = nonNaNPoint ?? point;
            const vv = vvController.getVirtualViewport(chart.yAxis);
            const vvPoint = vv.toViewportPoint(renderPoint);
            const graphics = this.getPoint(index++);
            const rgba = unpackRGBA(renderPoint.color, 1);

            graphics.x = vvPoint.x;
            graphics.y = vvPoint.y;
            graphics.tint = utils.rgb2hex(rgba);
            graphics.alpha = rgba[3];
            graphics.visible = true;
        }

        for (; index < this.children.length; index++) {
            this.children[index].visible = false;
        }
    }

    private getPoint(index: number): Graphics {
        return (this.children[index] ?? this.addChild(createPoint(POINT_RADIUS))) as Graphics;
    }
}

function createPoint(r: number, g = new Graphics()): Graphics {
    g.lineTextureStyle({ color: 0x0, width: 1 });
    g.beginFill(0xffffff, 1);
    g.drawCircle(0, 0, r);
    g.endFill();
    return g;
}
