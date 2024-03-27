// @ts-ignore
import { detectFont } from 'detect-font';
import { BitmapFont, TextStyle } from 'pixi.js';

export const fontFamily = detectFont(document.body);
export const resolution = window.devicePixelRatio;
export const chars = [
    // days
    // 'Mon',
    // 'Tue',
    // 'Wed',
    // 'Thu',
    // 'Fri',
    // 'Sat',
    // 'Sun',

    // Months
    // 'Jan',
    // 'Feb',
    // 'Mar',
    // 'Apr',
    // 'May',
    // 'Jun',
    // 'Jul',
    // 'Aug',
    // 'Sep',
    // 'Oct',
    // 'Nov',
    // 'Dec',

    // Chars
    'UTC',

    // numbers
    '1234567890',

    // symbols
    '/+-.: ',
]
    .map((str) => str.split(''))
    .flat()
    .filter((c, i, a) => a.indexOf(c) === i);

export const defaultFontName = 'BitmapFont-default';
export const defaultBitmapFontStyle = new TextStyle({
    fontFamily: fontFamily,
    fontSize: 12,
});

// INIT DEFAULT BITMAP FONT
BitmapFont.from(defaultFontName, defaultBitmapFontStyle, {
    resolution,
    chars,
});
