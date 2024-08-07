import type { Nil } from '@common/types';
import { isEmpty, isNil, isNumber } from 'lodash-es';

import { default as colors } from './colors.json';

export enum EDefaultColors {
    chart = '#ff0000',
    level = '#00ff00',
}

export { blue, grey, green, red, orange, yellow, geekblue, purple } from '@ant-design/colors';

export function getHexCssColor(color?: Nil | string | number): string | undefined {
    if (isNil(color)) {
        return undefined;
    }

    if (isNumber(color)) {
        return hex2string(color);
    }

    const cleanColorValue = cleanColor(color as string);

    if (isNamedColor(cleanColorValue)) {
        return normalizeHexCssColor((colors as Record<string, string>)[cleanColorValue]);
    }

    if (isHexColor(cleanColorValue)) {
        return normalizeHexCssColor(cleanColorValue);
    }

    return undefined;
}

export function getFormattedColor(color: Nil | string | number): string | undefined {
    if (isNil(color)) {
        return undefined;
    }

    if (isNumber(color)) {
        return hex2string(color);
    }

    const cleanColorName = cleanColor(color as string);

    if (isNamedColor(cleanColorName)) {
        return cleanColorName;
    }

    if (isHexColor(cleanColorName)) {
        return normalizeHexCssColor(cleanColorName)!;
    }

    return undefined;
}

export function hex2string(color: number): string {
    // Don't use utils.hex2string as it requires pixi.js import which breaks worker
    const rawHex = color.toString(16).padStart(3, '0');

    const result = rawHex.length === 3 ? rawHex.replace(/(\w)/g, '$1$1') : rawHex.padStart(6, '0');

    return `#${result.substring(0, 6)}`;
}

export function hex2rgb(hex: number, out: [number, number, number] = [0, 0, 0]) {
    out[0] = ((hex >> 16) & 255) / 255;
    out[1] = ((hex >> 8) & 255) / 255;
    out[2] = (hex & 255) / 255;
    return out;
}

export function string2hex(color: string): number {
    // Don't use utils.string2hex as it requires pixi.js import which breaks worker
    if (!isHexColor(color)) {
        return 0;
    }

    if (color.startsWith('#')) {
        color = color.substring(1);
    }

    if (color.length === 3) {
        color = color.replace(/(\w)/g, '$1$1');
    }

    return parseInt(color, 16);
}

export function normalizeHexCssColor(hexColor: string): string | undefined {
    if (isEmpty(hexColor)) {
        return undefined;
    }

    return hexColor.startsWith('#') ? hexColor : `#${hexColor}`;
}

function isHexColor(color: string): boolean {
    return !isEmpty(color) && /^#?(?:[0-9a-fA-F]{3}){1,2}$/.test(color);
}

function isNamedColor(colorId: string): boolean {
    const colorsMap = colors as Record<string, string>;

    return !isEmpty(colorId) && colorId in colorsMap;
}

function cleanColor(color: string): string {
    return (color as string).replace(/\s/g, '').toLowerCase();
}

// @see https://stackoverflow.com/a/44134328
export function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export function getHexCssColorSet(
    numColors: number,
    saturation: number,
    lightness: number,
): string[] {
    return Array(numColors)
        .fill(0)
        .map((_, i) => {
            // Select a set of colors from the hue wheel
            const hue = Math.round((359 * i) / numColors);
            return hslToHex(hue, saturation, lightness);
        });
}
