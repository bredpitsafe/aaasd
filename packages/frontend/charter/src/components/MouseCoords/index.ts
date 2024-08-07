import type { Someseconds } from '@common/types';
import type { TPoint } from '@frontend/common/src/types/shape';
import { fixedLengthNumber } from '@frontend/common/src/utils/fixedLengthNumber';
import type { Renderer } from 'pixi.js';
import { BitmapText, Container, Graphics } from 'pixi.js';

import { getState, getZonedTime } from '../../Charter/methods';
import { defaultFontName, fontSize } from '../../font';
import type { IContext } from '../../types';
import { computeSecondsAndSecondFractions } from '../../utils/computeSecondsAndSecondFractions';
import { pointOnScreen } from '../../utils/intersection';
import { getTextMeasure } from '../../utils/textMeasures';
import { getHumanUnixTimeOptions, humanUnixTime } from '../../utils/time';
import { EVirtualViewport } from '../ChartViewport/defs';

const TEXT_GAP = 4;
const LINE_WIDTH = 1;

export class MouseCoords extends Container {
    private static yToString(value: number): string {
        return fixedLengthNumber(value, 10);
    }

    private readonly graphics = {
        lineX: createLine(),
        backgroundX: createBackground(),
        lineY: createLine(),
        backgroundYLeft: createBackground(),
        backgroundYRight: createBackground(),
    };

    private readonly texts = {
        textX: new BitmapText('0', { fontName: defaultFontName, fontSize }),
        textYLeft: new BitmapText('0', { fontName: defaultFontName, fontSize }),
        textYRight: new BitmapText('0', { fontName: defaultFontName, fontSize }),
    };

    constructor(private ctx: IContext) {
        super();

        this.addChild(...Object.values(this.graphics));
        this.addChild(...Object.values(this.texts));
    }

    render(renderer: Renderer): void {
        const { mouseController } = this.ctx;

        const mousePoint = mouseController.getCanvasMouseCoords();
        const pseudoMousePoint = mouseController.getPseudoCanvasMouseCoords();
        const mouseHovered = pointOnScreen(this.ctx, mousePoint);
        const pseudoMouseHovered = pointOnScreen(this.ctx, pseudoMousePoint);

        this.updateComponentVisibility(mouseHovered, pseudoMouseHovered);
        this.renderLines(mouseHovered, mousePoint, pseudoMousePoint);
        this.renderXAxisText(pseudoMousePoint);
        this.renderYAxisLeftText(pseudoMousePoint);
        this.renderYAxisRightText(pseudoMousePoint);

        super.render(renderer);
    }

    private updateComponentVisibility(mouseHovered: boolean, pseudoMouseHovered: boolean): void {
        const { showPseudoHorizontalCrosshair, showPseudoHorizontalCrosshairTooltips } = getState(
            this.ctx,
        );

        const visible = showPseudoHorizontalCrosshairTooltips ? pseudoMouseHovered : mouseHovered;

        this.texts.textX.visible = visible;

        this.texts.textYLeft.visible = this.graphics.backgroundYLeft.visible =
            visible &&
            this.ctx.virtualViewportController.isVirtualViewportVisible(EVirtualViewport.left);

        this.texts.textYRight.visible = this.graphics.backgroundYRight.visible =
            visible &&
            this.ctx.virtualViewportController.isVirtualViewportVisible(EVirtualViewport.right);

        this.graphics.lineX.visible = mouseHovered || pseudoMouseHovered;
        this.graphics.lineY.visible =
            mouseHovered || (pseudoMouseHovered && showPseudoHorizontalCrosshair);

        this.graphics.backgroundX.visible = visible;
    }

    private renderLines(mouseHovered: boolean, mousePoint: TPoint, pseudoMousePoint: TPoint): void {
        const { graphicsGap } = getState(this.ctx);
        const { screenWidth, screenHeight } = this.ctx.viewport;
        const { lineX, lineY } = this.graphics;

        if (lineX.visible) {
            lineX.x = mouseHovered ? mousePoint.x : pseudoMousePoint.x;
            lineX.y = 0;
            lineX.scale.y = screenHeight - graphicsGap.b;
        }

        if (lineY.visible) {
            lineY.x = graphicsGap.l;
            lineY.y = mouseHovered ? mousePoint.y : pseudoMousePoint.y;
            lineY.scale.x = screenWidth - graphicsGap.l - graphicsGap.r;
        }
    }

    private renderXAxisText(mousePoint: TPoint): void {
        const { textX } = this.texts;

        if (!textX.visible) return;

        const state = getState(this.ctx);
        const { graphicsGap } = state;
        const { position, scale, screenWidth, screenHeight } = this.ctx.viewport;
        const { backgroundX } = this.graphics;

        const textMeasure = getTextMeasure(textX.text);
        const width = Math.round(textMeasure.width + TEXT_GAP * 2 + 6);
        const height = Math.round(Math.min(textMeasure.height + TEXT_GAP * 2, graphicsGap.b));
        const x = Math.round(
            Math.min(
                Math.max(mousePoint.x - width / 2, graphicsGap.l),
                screenWidth - width - graphicsGap.r,
            ),
        );
        const y = Math.round(screenHeight - graphicsGap.b + LINE_WIDTH);

        textX.text = this.xToString(getZonedTime(state, (mousePoint.x - position.x) / scale.x));
        textX.x = x + TEXT_GAP;
        textX.y = Math.round(y + Math.max(0, height - textMeasure.height) / 2);
        backgroundX.x = x;
        backgroundX.y = y;
        backgroundX.scale.x = width;
        backgroundX.scale.y = height;
    }

    private renderYAxisLeftText(mousePoint: TPoint): void {
        const { textYLeft } = this.texts;

        if (!textYLeft.visible) return;

        const { graphicsGap } = getState(this.ctx);
        const { position, scale } = this.ctx.viewport;
        const { backgroundYLeft } = this.graphics;

        const textMeasure = getTextMeasure(textYLeft.text);
        const width = Math.round(textMeasure.width + TEXT_GAP * 2 + 4);
        const height = Math.round(textMeasure.height + TEXT_GAP * 2);
        const x = Math.round(graphicsGap.l + LINE_WIDTH);
        const y = Math.round(Math.max(mousePoint.y - height, graphicsGap.t));

        textYLeft.text = MouseCoords.yToString((position.y - mousePoint.y) / scale.y);

        textYLeft.x = x + TEXT_GAP;
        textYLeft.y = y + TEXT_GAP;

        backgroundYLeft.x = x;
        backgroundYLeft.y = y;
        backgroundYLeft.scale.x = width;
        backgroundYLeft.scale.y = height;
    }

    private renderYAxisRightText(mousePoint: TPoint): void {
        const { textYRight } = this.texts;

        if (!textYRight.visible) return;

        const { graphicsGap } = getState(this.ctx);
        const { position, scale, screenWidth } = this.ctx.viewport;
        const { virtualViewportController } = this.ctx;
        const { backgroundYRight } = this.graphics;

        const textMeasure = getTextMeasure(textYRight.text);
        const width = Math.round(textMeasure.width + TEXT_GAP * 2 + 4);
        const height = Math.round(textMeasure.height + TEXT_GAP * 2);
        const x = Math.round(screenWidth - graphicsGap.r - width - 2 * LINE_WIDTH);
        const y = Math.round(Math.max(mousePoint.y - height, graphicsGap.t));

        textYRight.text = MouseCoords.yToString(
            virtualViewportController
                .getVirtualViewport(EVirtualViewport.right)
                .toVirtualViewportY((position.y - mousePoint.y) / scale.y),
        );

        textYRight.x = x + TEXT_GAP;
        textYRight.y = y + TEXT_GAP;

        backgroundYRight.x = x;
        backgroundYRight.y = y;
        backgroundYRight.scale.x = width;
        backgroundYRight.scale.y = height;
    }

    private xToString(value: Someseconds): string {
        return humanUnixTime(
            computeSecondsAndSecondFractions(
                this.ctx.state,
                value,
                this.ctx.state.clientTimeIncrement,
                this.ctx.state.serverTimeIncrement,
            ),
            getHumanUnixTimeOptions(this.ctx),
        );
    }
}

function createBackground(g: Graphics = new Graphics()): Graphics {
    g.beginFill(0xffdbdb, 0.85);
    g.drawRect(0, 0, 1, 1);
    g.endFill();

    return g;
}

function createLine(g: Graphics = new Graphics()): Graphics {
    g.beginFill(0xb7b7b7, 1);
    g.drawRect(0, 0, 1, 1);
    g.endFill();

    return g;
}
