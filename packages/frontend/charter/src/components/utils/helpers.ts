import { Matrix } from 'pixi.js';

const tmpMatrix = new Matrix();
export function computeFinalMatrixArray(
    projectionMatrix: Matrix,
    worldTransform: Matrix,
    source?: Float32Array,
): Float32Array {
    return projectionMatrix.copyTo(tmpMatrix).append(worldTransform).toArray(true, source);
}
