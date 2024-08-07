import { milliseconds2hours } from '@common/utils';
import { isNil } from 'lodash-es';
import { BitmapText, Container } from 'pixi.js';

import { somesecondsToMilliseconds } from '../../Charter/methods';
import { defaultFontName, fontSize } from '../../font';
import type { IContext } from '../../types';
import { getTextMeasure } from '../../utils/textMeasures';
import { DefaultAltColorLines, DefaultColorLines, LINE_WIDTH, NOTCH_Y_WIDTH } from './defs';

const TIMEZONE_X_OFFSET = 14;
const TIMEZONE_Y_OFFSET = 24;
const X_AXIS_LABEL_Y_AXIS_PADDING = 3;
const Y_AXIS_LABEL_X_AXIS_PADDING = 5;
const Y_AXIS_LABEL_Y_NOTCH_PADDING = 2;

export class GridAxisTexts extends Container {
    private readonly textByCommonAxisX: BitmapText = new BitmapText('', {
        fontName: defaultFontName,
        fontSize,
    });
    private readonly labelBitmaps: BitmapText[] = [];
    private readonly mainFontName: string;
    private readonly altFontName: string;
    private readonly textHeight: number;

    constructor(
        private ctx: IContext,
        private colorLines = DefaultColorLines,
        private altColorLines = DefaultAltColorLines,
    ) {
        super();

        this.addChild(this.textByCommonAxisX);

        this.textHeight = getTextMeasure('0').height;
        this.mainFontName = ctx.fontController.getFontName(this.colorLines);
        this.altFontName = ctx.fontController.getFontName(this.altColorLines);
    }

    updateTransform(): void {
        const {
            state: { timeZone, graphicsGap },
            viewport: { screenWidth, screenHeight },
            gridMeasuresController,
        } = this.ctx;
        const measures = gridMeasuresController.getMeasures();

        const { xFromTo, xAxisNotches, yAxisNotches } = measures;
        const shiftToUTC = milliseconds2hours(somesecondsToMilliseconds(this.ctx.state, timeZone));
        const sign = Math.sign(shiftToUTC) === 1 ? '-' : '+';
        const value = Math.abs(shiftToUTC);
        this.textByCommonAxisX.text = `UTC${sign}${value} ${xFromTo.join(' - ')}`;
        this.textByCommonAxisX.x =
            screenWidth - getTextMeasure(this.textByCommonAxisX.text).width - TIMEZONE_X_OFFSET;
        this.textByCommonAxisX.y = screenHeight - graphicsGap.b - TIMEZONE_Y_OFFSET;

        this.labelBitmaps.forEach((labelBitmap) => (labelBitmap.visible = false));
        let bitmapIndex = 0;

        const xAxisYPosition = screenHeight - graphicsGap.b + X_AXIS_LABEL_Y_AXIS_PADDING;
        for (const notch of xAxisNotches) {
            this.addBitmapText(
                bitmapIndex++,
                notch.label,
                notch.x - notch.labelWidth / 2,
                xAxisYPosition,
                this.mainFontName,
            );
        }

        const leftEdge = graphicsGap.l;
        const rightEdge = screenWidth - graphicsGap.r - LINE_WIDTH;
        let timestampExtraPadding = 0;

        for (const notch of yAxisNotches) {
            const textY = notch.y - this.textHeight - Y_AXIS_LABEL_Y_NOTCH_PADDING;

            if (notch.leftLabel !== undefined) {
                this.addBitmapText(
                    bitmapIndex++,
                    notch.leftLabel,
                    leftEdge + Y_AXIS_LABEL_X_AXIS_PADDING,
                    textY,
                    this.mainFontName,
                );
            }

            if (notch.rightLabel !== undefined && notch.rightLabelWidth !== undefined) {
                timestampExtraPadding = Math.max(timestampExtraPadding, notch.rightLabelWidth);

                this.addBitmapText(
                    bitmapIndex++,
                    notch.rightLabel,
                    rightEdge - Y_AXIS_LABEL_X_AXIS_PADDING - notch.rightLabelWidth,
                    textY,
                    this.altFontName,
                );
            }
        }

        if (timestampExtraPadding > 0) {
            this.textByCommonAxisX.x -= timestampExtraPadding + NOTCH_Y_WIDTH;
        }

        super.updateTransform();
    }

    private addBitmapText(
        arrayIndex: number,
        text: string,
        textX: number,
        textY: number,
        fontName: string,
    ) {
        if (isNil(this.labelBitmaps[arrayIndex])) {
            this.labelBitmaps[arrayIndex] = new BitmapText('', { fontName, fontSize });
            this.addChild(this.labelBitmaps[arrayIndex]);
        }

        const bitmapText = this.labelBitmaps[arrayIndex];

        bitmapText.text = text;
        bitmapText.y = Math.round(textY);
        bitmapText.x = Math.round(textX);
        bitmapText.fontName = fontName;
        bitmapText.fontSize = fontSize;
        bitmapText.visible = true;
    }
}
