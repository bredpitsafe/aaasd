import memoize from 'memoizee';
import { TextMetrics } from 'pixi.js';

import { defaultBitmapFontStyle } from '../font';

export const getTextMeasure = (str: string): { width: number; height: number } => {
    return str
        .split('')
        .map(getCharMeasure)
        .reduce(
            (acc, measure) => {
                acc.width += measure.width;
                acc.height = Math.max(acc.height, measure.height);
                return acc;
            },
            { width: 0, height: 0 },
        );
};

const getCharMeasure = memoize(
    (char: string) => TextMetrics.measureText(char, defaultBitmapFontStyle),
    { primitive: true },
);
