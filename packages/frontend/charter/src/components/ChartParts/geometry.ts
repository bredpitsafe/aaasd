import { getIncreasedFloat32Array } from '@frontend/common/src/utils/getIncreasedArray';
import { debounce, pull } from 'lodash-es';
import { Geometry } from 'pixi.js';

import { vertexShader } from './shaders';

export const geometry = new Geometry().addAttribute(
    vertexShader.attributes.aVertexID,
    new Float32Array(1),
    1,
);

const lens: number[] = [];

function setVertexLength(len: number) {
    const buffer = geometry.getBuffer(vertexShader.attributes.aVertexID);

    if (len > 0 && buffer.data.length !== len) {
        buffer.update(getIncreasedFloat32Array(len));
    }
}

// An easy way to avoid frequent length changes is to use the number's bit depth
function getLength(arr: number[]) {
    const max = lens.length === 0 ? 0 : Math.max(...arr);
    return 10 ** String(max).length;
}

export function addVertexLength(len: number): void {
    lens.push(len);
    setVertexLength(getLength(lens));
}

export function deleteVertexLength(len: number) {
    pull(lens, len);
    // Don't update length on change immediately, it doesn't make sense
    debouncedSetVertexLength();
}

const debouncedSetVertexLength = debounce(() => setVertexLength(getLength(lens)), 10_000);
