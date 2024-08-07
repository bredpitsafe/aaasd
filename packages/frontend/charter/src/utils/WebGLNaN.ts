import { POINT_ITEM_SIZE } from '../../lib/Parts/def';

export const NAN_WEBGL_VALUE = 3.4028234663852886e38;

export function replaceNaNWithWebGLNaN(
    source: Float32Array,
    startIndex = 1,
    endIndex = source.length,
    step = POINT_ITEM_SIZE,
): Float32Array {
    for (let index = startIndex; index < endIndex; index += step) {
        if (isNaN(source[index])) {
            source[index] = NAN_WEBGL_VALUE;
        }
    }

    return source;
}
