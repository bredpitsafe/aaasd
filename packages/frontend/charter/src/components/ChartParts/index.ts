import type { Someseconds } from '@common/types';
import { loggerCharter } from '@frontend/common/src/utils/Tracing/Children/Charter.ts';
import { findLastIndex, isNil } from 'lodash-es';
import type { Renderer, Shader } from 'pixi.js';
import { DRAW_MODES, Mesh } from 'pixi.js';

import type { TPart, TPartAbsPoint, TPointAbsValue, TPointColor } from '../../../lib/Parts/def';
import { createPartAbsPoint, getPoint, toAbsPointValue } from '../../../lib/Parts/utils/point';
import { getChartTimeNow, getState } from '../../Charter/methods';
import type { IContext } from '../../types';
import { HAS_BROKEN_VERTEX_ID } from '../../utils/detect';
import { PixiComponent } from '../../utils/Pixi/PixiComponent';
import { replaceNaNWithWebGLNaN } from '../../utils/WebGLNaN';
import { EChartType } from '../Chart/defs';
import { getChartTypeIndex } from '../utils/getChartTypeIndex';
import { computeFinalMatrixArray } from '../utils/helpers';
import { ROUND_JOINS_VERTEXES } from '../utils/shaders/computePositions';
import { ChartPartsDebug } from './debug';
import { MAX_CUMULATIVE_SUM } from './def';
import { addVertexLength, deleteVertexLength, geometry } from './geometry';
import { MAX_ARR_LENGTH, vertexShader } from './shaders';

export type TChartPartsProps = {
    ctx: IContext;
    type: EChartType;
    parts: TPart[];
    striving?: boolean;
};

const {
    uType,
    uRightestPoint,
    uLeftestPoint,
    uInstanceSize,
    uPartsStore,
    uPartsStoreCoord,
    uPartsSizeCumulativeSum,
    uPartsOffset,
    uFinalMatrix,
} = vertexShader.uniforms;

export class ChartParts extends PixiComponent(class extends Mesh<Shader> {}) {
    drawMode: DRAW_MODES = DRAW_MODES.TRIANGLES;

    private leftestPoint = new Float32Array(4);
    private rightestPoint = new Float32Array(4);
    private finalMatrix = new Float32Array(9);

    private instanceCount = 0;
    private partsOffsets!: Float32Array;
    private partsStoreCoord!: Float32Array;
    private partsSizeCumulativeSum!: Float32Array;

    constructor(public props: TChartPartsProps) {
        super(geometry, props.ctx.sharedShader.chartParts);
        this.updateProps(props);

        props.ctx.debugController.addDebugger(this, ChartPartsDebug);
    }

    updateProps(props: TChartPartsProps) {
        super.updateProps(props);

        if (props.parts.length > MAX_ARR_LENGTH) {
            loggerCharter.warn('parts array is too long, it will be truncated');
        }

        this.resetState();

        const { partsCoordsController, partsController } = props.ctx;
        const { parts } = props;

        if (parts.length === 0) return;

        this.partsOffsets = new Float32Array((parts.length + 2) * 2);
        this.partsStoreCoord = new Float32Array((parts.length + 2) * 2);
        this.partsSizeCumulativeSum = new Float32Array(parts.length + 2);

        let j = 0;

        // Fake part for Leftest point
        this.instanceCount += getPartSize(props.type, 1);
        this.partsSizeCumulativeSum[j++] = this.instanceCount;

        for (const part of parts) {
            if (part.size === 0) continue;

            const partOffset = partsCoordsController.getPartDelta(part);
            const textureCoord = partsController.getStoreTextureCoord(part.seriesId, part.id);

            this.instanceCount += getPartSize(props.type, part.size);
            this.partsSizeCumulativeSum[j] = this.instanceCount;
            this.partsStoreCoord[j * 2] = textureCoord!.x;
            this.partsStoreCoord[j * 2 + 1] = textureCoord!.y;
            this.partsOffsets[j * 2] = partOffset.x;
            this.partsOffsets[j * 2 + 1] = partOffset.y;
            j++;
        }

        // Fake part for Rightest point
        this.instanceCount += getPartSize(props.type, 1);
        this.partsSizeCumulativeSum[j] = MAX_CUMULATIVE_SUM;
        this.size =
            getInstanceCount(props.type, this.instanceCount) * getPointVertexCount(props.type);

        if (HAS_BROKEN_VERTEX_ID) {
            addVertexLength(this.size);
        }
    }

    onUnmount() {
        if (HAS_BROKEN_VERTEX_ID) {
            deleteVertexLength(this.size);
        }
    }

    render(renderer: Renderer): void {
        if (this.instanceCount === 0) return;

        this.updateEdgePoints();
        this.updateUniforms(renderer);
        this.updateBlending(renderer);

        super.render(renderer);

        this.resetBlending(renderer);
    }

    private updateUniforms(renderer: Renderer): void {
        const { partsController } = this.props.ctx;
        const { type } = this.props;
        const { uniforms } = this.material;
        const worldTransform = this.transform.worldTransform;
        const projectionMatrix = renderer.projection.projectionMatrix;

        uniforms[uType] = getChartTypeIndex(type);
        uniforms[uPartsStore] = partsController.getStoreRenderTexture();
        uniforms[uLeftestPoint] = replaceNaNWithWebGLNaN(this.leftestPoint);
        uniforms[uRightestPoint] = replaceNaNWithWebGLNaN(this.rightestPoint);

        uniforms[uInstanceSize] = getPointVertexCount(type);
        uniforms[uPartsStoreCoord] = this.partsStoreCoord;
        uniforms[uPartsOffset] = this.partsOffsets;
        uniforms[uPartsSizeCumulativeSum] = this.partsSizeCumulativeSum;
        uniforms[uFinalMatrix] = computeFinalMatrixArray(
            projectionMatrix,
            worldTransform,
            this.finalMatrix,
        );
    }

    private resetState(): void {
        if (HAS_BROKEN_VERTEX_ID) {
            deleteVertexLength(this.size);
        }

        this.size = 0;
        this.instanceCount = 0;
        this.leftestPoint[0] = NaN;
        this.leftestPoint[1] = NaN;
        this.rightestPoint[0] = NaN;
        this.rightestPoint[1] = NaN;
    }

    private updateBlending({ gl }: Renderer): void {
        if (this.props.type === EChartType.dots) return;
        if (this.props.type === EChartType.points) return;

        // What's going on here - https://webglfundamentals.org/webgl/lessons/webgl-qna-don-t-blend-a-polygon-that-crosses-itself.html
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(
            gl.EQUAL, // the test
            0, // reference value
            0xff, // mask
        );
        gl.stencilOp(
            gl.KEEP, // what to do if the stencil test fails
            gl.KEEP, // what to do if the depth test fails
            gl.INCR, // what to do if both tests pass
        );
        gl.clear(gl.STENCIL_BUFFER_BIT);
    }

    private resetBlending({ gl }: Renderer): void {
        if (this.props.type === EChartType.dots) return;
        if (this.props.type === EChartType.points) return;

        gl.disable(gl.STENCIL_TEST);
    }

    private updateEdgePoints(): void {
        const { ctx, type, parts, striving } = this.props;
        const last = parts[parts.length - 1];

        const absLeftestPoint = getLeftestPoint(parts);
        const absRightestPoint = getRightestPoint(parts, type, absLeftestPoint);
        const isLive = last.unresolved === 'live' && (striving || striving === undefined);

        const delta = ctx.partsCoordsController.getChartDelta(last.seriesId);

        this.leftestPoint[0] = absLeftestPoint.x - delta.x;
        this.leftestPoint[1] = absLeftestPoint.y - delta.y;
        this.leftestPoint[2] = absLeftestPoint.color;
        this.leftestPoint[3] = absLeftestPoint.width;

        this.rightestPoint[0] = (isLive ? this.getNow() : absRightestPoint.x) - delta.x;
        this.rightestPoint[1] = absRightestPoint.y - delta.y;
        this.rightestPoint[2] = absRightestPoint.color;
        this.rightestPoint[3] = absRightestPoint.width;
    }

    private getNow(): Someseconds {
        const { ctx, parts } = this.props;
        const last = parts[parts.length - 1];
        const state = getState(ctx);
        const now = getChartTimeNow(state, last.seriesId) - state.serverTimeIncrement;

        return now as Someseconds;
    }
}
function getPartSize(type: EChartType, size: number): number {
    switch (type) {
        case EChartType.points:
        case EChartType.lines:
        case EChartType.area:
        case EChartType.dots:
            return size;
        case EChartType.stairs:
            return size * 2;
    }
}

function getPointVertexCount(type: EChartType) {
    switch (type) {
        case EChartType.lines:
        case EChartType.stairs:
            return 6 + ROUND_JOINS_VERTEXES;
        case EChartType.area:
            return 6;
        case EChartType.dots:
            return ROUND_JOINS_VERTEXES;
        case EChartType.points:
        default:
            return 6;
    }
}

function getInstanceCount(type: EChartType, size: number) {
    switch (type) {
        case EChartType.area:
        case EChartType.lines: {
            size -= 1;
            break;
        }
        case EChartType.stairs: {
            size -= 2;
            break;
        }
    }

    return Math.max(1, size);
}

const NAN_POINT = createPartAbsPoint(
    NaN as Someseconds,
    NaN as TPointAbsValue,
    0 as TPointColor,
    0,
);

function getLeftestPoint(parts: TPart[]): TPartAbsPoint {
    return parts[0]?.absLeftPoint ?? NAN_POINT;
}

function getRightestPoint(
    parts: TPart[],
    chartType: EChartType,
    leftestAbsValue: TPartAbsPoint,
): TPartAbsPoint {
    const lastPart = parts[parts.length - 1];

    if (lastPart.unresolved !== false) return NAN_POINT;

    // We can compute absRightPoint for stairs from parts or leftest point
    if (isNil(lastPart.absRightPoint) && chartType === EChartType.stairs) {
        const lastNotEmptyPartIndex = findLastIndex(parts, (p) => p.size > 0);
        const minPartIndex = Math.max(lastNotEmptyPartIndex, 0);
        const part = parts[minPartIndex];
        const lastPoint = getPoint(part, -1);
        const pointValue =
            (lastPoint !== undefined ? toAbsPointValue(part, lastPoint.y) : undefined) ??
            leftestAbsValue.y;
        const pointColor = lastPoint?.color ?? leftestAbsValue.color;
        const pointWidth = lastPoint?.width ?? leftestAbsValue.width;

        return createPartAbsPoint(lastPart.interval[1], pointValue, pointColor, pointWidth);
    }

    return lastPart.absRightPoint ?? NAN_POINT;
}
