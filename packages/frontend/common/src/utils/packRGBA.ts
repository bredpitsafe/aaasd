import type { Opaque } from '@common/types';
import { isString } from 'lodash-es';

import { hex2rgb, string2hex } from './colors';

export type TArrRGBA = [number, number, number, number];
export type TPackedRGBA = Opaque<'RGBA', number>;

const packUint8Array = new Uint8Array(4);
const packFloat32Array = new Float32Array(packUint8Array.buffer);

export function packRGBA(r: number, g: number, b: number, a: number): TPackedRGBA {
    packUint8Array[0] = r >> 1;
    packUint8Array[1] = g >> 1;
    packUint8Array[2] = b >> 1;
    packUint8Array[3] = a >> 1;

    return packFloat32Array[0] as TPackedRGBA;
}

const unpackFloat32Array = new Float32Array(1);
const unpackUint8Array = new Uint8Array(unpackFloat32Array.buffer);

export function unpackRGBA(
    packed: TPackedRGBA,
    max: 1 | 255,
    out: [number, number, number, number] = [0, 0, 0, 0],
): TArrRGBA {
    unpackFloat32Array[0] = packed;

    out[0] = (unpackUint8Array[0] << 1) / 255 / max;
    out[1] = (unpackUint8Array[1] << 1) / 255 / max;
    out[2] = (unpackUint8Array[2] << 1) / 255 / max;
    out[3] = (unpackUint8Array[3] << 1) / 255 / max;

    return out;
}

export function hexToPackedRGBA(hexColor: string | number = 0x000000, opacity = 1): TPackedRGBA {
    opacity = (opacity ?? 1) * 255;

    if (isString(hexColor)) {
        hexColor = string2hex(hexColor);
    }

    const rgb = hex2rgb(hexColor).map((v) => v * 255) as [number, number, number];

    return packRGBA(...rgb, opacity);
}
