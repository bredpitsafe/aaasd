import { isMac } from '@frontend/common/src/utils/detect';
import { isNil } from 'lodash-es';

let canvas = document.createElement('canvas');
let gl = canvas.getContext('webgl');
let debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
let renderer = isNil(debugInfo)
    ? undefined
    : (gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)?.toLowerCase() as undefined | string);

// https://bugs.chromium.org/p/chromium/issues/detail?id=1315104&q=gl_vertexID&can=2
export const HAS_BROKEN_VERTEX_ID =
    isMac &&
    (renderer === undefined
        ? false /* default value(node env) */
        : renderer.includes('angle') && !renderer.includes('apple'));

export const MAX_TEXTURE_SIZE = isNil(gl)
    ? 64 /* default value(node env) */
    : (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);

export const MAX_VERTEX_UNIFORM_VECTORS = isNil(gl)
    ? 1024 /* default value(node env) */
    : (gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) as number);

// clear memory
gl?.getExtension('WEBGL_lose_context')?.loseContext();
// @ts-ignore
canvas = undefined;
// @ts-ignore
gl = undefined;
// @ts-ignore
debugInfo = undefined;
// @ts-ignore
renderer = undefined;
