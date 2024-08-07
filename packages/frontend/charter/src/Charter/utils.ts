import type { Someseconds } from '@common/types';
import { ENV, MIPMAP_MODES, Renderer, settings } from 'pixi.js';

import { generatePixelSizes } from '../utils/PixelSizes/generatePixelSizes';

export function settingPIXI() {
    settings.PREFER_ENV = ENV.WEBGL2;
    // Usable only for game textures
    settings.MIPMAP_TEXTURES = MIPMAP_MODES.OFF;

    // Remove unused plugins
    delete Renderer.__plugins['accessibility'];
    delete Renderer.__plugins['extract'];
    delete Renderer.__plugins['particle'];
    delete Renderer.__plugins['prepare'];
    delete Renderer.__plugins['tilingSprite'];
}

export function getPixelSizes(milli2someRatio: number): Someseconds[] {
    const secondFraction = (1_000 * milli2someRatio) as Someseconds;

    return generatePixelSizes(1 / secondFraction, 1 / Number.EPSILON / secondFraction).map((v) =>
        Math.round(v * secondFraction),
    ) as Someseconds[];
}
