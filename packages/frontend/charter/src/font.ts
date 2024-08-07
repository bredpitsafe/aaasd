import { BitmapFont, TextStyle } from 'pixi.js';

export const fontFamily = 'sans-serif';
export const fontSize = 12;
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
    fontSize: fontSize,
});

// INIT DEFAULT BITMAP FONT
BitmapFont.from(defaultFontName, defaultBitmapFontStyle, {
    resolution,
    chars,
});
