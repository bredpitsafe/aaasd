import { EMPTY_OBJECT } from '@frontend/common/src/utils/const';
import { macroTasks } from '@frontend/common/src/utils/TasksScheduler/macroTasks';
import type { Renderer, RenderTexture } from 'pixi.js';

/**
 * @public
 */
export function readPixels(
    renderer: Renderer,
    renderTexture: RenderTexture,
    rect: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    } = EMPTY_OBJECT,
    outBuffer?: Float32Array,
): Float32Array {
    const x = rect.x || 0;
    const y = rect.y || 0;
    const width = rect.width || renderTexture.width;
    const height = rect.height || renderTexture.height;

    const webglPixels = outBuffer || new Float32Array(4 * width * height);
    const gl = renderer.gl;

    renderer.renderTexture.bind(renderTexture);

    gl.readPixels(x, y, width, height, gl.RGBA, gl.FLOAT, webglPixels);

    renderer.renderTexture.bind();

    return webglPixels;
}

/**
 * @public
 */
export async function readPixelsAsync(
    renderer: Renderer,
    renderTexture: RenderTexture,
    rect: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    } = EMPTY_OBJECT,
    destBufferView: Float32Array,
    format?: GLenum,
    type?: GLenum,
    byteOffset?: number,
): Promise<Float32Array> {
    const gl = renderer.gl as WebGL2RenderingContext;
    const x = rect.x || 0;
    const y = rect.y || 0;
    const w = rect.width || renderTexture.width;
    const h = rect.height || renderTexture.height;

    format = format || gl.RGBA;
    type = type || gl.FLOAT;
    byteOffset = byteOffset || 0;

    const target = gl.PIXEL_PACK_BUFFER;
    const srcBuffer = gl.createBuffer()!;

    renderer.renderTexture.bind(renderTexture);
    gl.bindBuffer(target, srcBuffer);
    gl.bufferData(target, destBufferView.byteLength, gl.STREAM_READ);
    gl.readPixels(x, y, w, h, format, type, byteOffset);
    gl.bindBuffer(target, null);
    renderer.renderTexture.bind();

    await getBufferSubDataAsync(gl, target, srcBuffer, byteOffset, destBufferView);

    gl.deleteBuffer(srcBuffer);

    return destBufferView;
}

async function getBufferSubDataAsync(
    gl: WebGL2RenderingContext,
    target: GLenum,
    srcBuffer: WebGLBuffer,
    srcByteOffset: number,
    destBufferView: ArrayBufferView,
    destOffset?: GLuint,
    length?: GLuint,
) {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!;

    gl.flush();

    await clientWaitAsync(gl, sync, 0);

    gl.deleteSync(sync);

    gl.bindBuffer(target, srcBuffer);
    gl.getBufferSubData(target, srcByteOffset, destBufferView, destOffset, length);
    gl.bindBuffer(target, null);

    return destBufferView;
}

function clientWaitAsync(
    gl: WebGL2RenderingContext,
    sync: WebGLSync,
    flags: GLbitfield,
): Promise<void> {
    return new Promise((resolve, reject) => {
        // timeout for check status, the choice was made empirically
        const deleteInterval = macroTasks.addInterval(test, 8);

        function test() {
            const res = gl.clientWaitSync(sync, flags, 0);

            switch (res) {
                case gl.ALREADY_SIGNALED:
                case gl.CONDITION_SATISFIED:
                    deleteInterval();
                    return resolve();
                case gl.WAIT_FAILED:
                    deleteInterval();
                    return reject('clientWaitAsync WAIT_FAILED');
                case gl.TIMEOUT_EXPIRED:
                    return; // skip
            }
        }
    });
}
