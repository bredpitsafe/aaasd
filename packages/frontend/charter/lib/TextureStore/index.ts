import { getIncreasedFloat32Array } from '@frontend/common/src/utils/getIncreasedArray';
import { frameTasks } from '@frontend/common/src/utils/TasksScheduler/frameTasks';
import {
    ALPHA_MODES,
    BaseRenderTexture,
    DRAW_MODES,
    FORMATS,
    Geometry,
    MIPMAP_MODES,
    Program,
    Renderer,
    RenderTexture,
    SCALE_MODES,
    Shader,
    Sprite,
    Texture,
    TYPES,
} from 'pixi.js';

import { HAS_BROKEN_VERTEX_ID, MAX_TEXTURE_SIZE } from '../../src/utils/detect';
import { fragment, vertex } from './shaders';

const { aVertexID, aValues } = vertex.attributes;
const { uStartPosition, uResolution } = vertex.uniforms;

export const VALUES_PER_PIXEL = 4;
const MAX_RAW_LIMIT = MAX_TEXTURE_SIZE ** 2 * VALUES_PER_PIXEL;

type TWritableData = {
    segmentX: number;
    segmentY: number;
    offset: number;
    source: Float32Array;
};

export class TextureStore {
    public pixelWidth: number;
    public pixelHeight: number;
    public renderTexture: RenderTexture;

    private isDestroyed = false;

    private resizeToSegmentCount: undefined | number;
    private writableData: TWritableData[] = [];

    private shader: Shader;
    private geometry: Geometry;

    private destroyTask: undefined | VoidFunction;

    constructor(
        private renderer: Renderer,
        public segmentSize: number,
        public segmentCount: number,
    ) {
        if (MAX_TEXTURE_SIZE % segmentSize !== 0) {
            throw new Error(`maxTextureSize must be modulo to segmentLength`);
        }

        if (VALUES_PER_PIXEL * segmentSize * segmentCount > MAX_RAW_LIMIT) {
            throw new Error(`Requested store size is too big, max is ${MAX_RAW_LIMIT}`);
        }

        this.shader = new Shader(new Program(vertex.shader, fragment.shader), {
            [uResolution]: new Float32Array(2),
            [uStartPosition]: new Float32Array(2),
        });
        this.geometry = new Geometry()
            .addAttribute(aValues, new Float32Array(0), VALUES_PER_PIXEL)
            .addAttribute(aVertexID, new Float32Array(0));

        this.pixelWidth = Math.min(segmentSize * segmentCount, MAX_TEXTURE_SIZE);
        this.pixelHeight = computeTextureHeight(segmentSize, segmentCount);
        this.renderTexture = createRenderTexture(this.pixelWidth, this.pixelHeight);

        this.updateUniformAndAttributes();
    }

    public destroy(): void {
        this.isDestroyed = true;
        this.destroyTask?.();
        this.destroyTask = undefined;
        this.writableData.length = 0;
        this.shader.destroy();
        this.geometry.destroy();
        this.renderTexture.destroy(true);
        // @ts-ignore
        this.renderer = null;
    }

    public resize(segmentCount: number): void {
        if (segmentCount !== this.segmentCount) {
            this.resizeToSegmentCount = segmentCount;
        }
    }

    public scheduleWriteToTexture(
        segmentX: number,
        segmentY: number,
        offset: number,
        source: Float32Array,
    ): void {
        if (offset % VALUES_PER_PIXEL !== 0) {
            throw new Error(`Offset must be modulo to ${VALUES_PER_PIXEL}`);
        }
        if (source.length % VALUES_PER_PIXEL !== 0) {
            throw new Error(`Source must be modulo to ${VALUES_PER_PIXEL}`);
        }
        if (source.length > this.segmentSize * VALUES_PER_PIXEL) {
            throw new Error(`Source can't be more than can contain one segment`);
        }
        if (source.length === 0) {
            return;
        }

        this.writableData.push({ segmentX, segmentY, offset, source });

        if (this.writableData.length === 1) {
            this.destroyTask = frameTasks.addTask(this.forceWriteToTexture, TASK_OPTIONS);
        }
    }

    public forceWriteToTexture = () => {
        if (this.isDestroyed) return;

        this.destroyTask = undefined;
        this.tryResize();
        this.tryExecWriteToTexture();
    };

    private tryResize() {
        if (this.resizeToSegmentCount !== undefined) {
            this.execResize(this.resizeToSegmentCount);
            this.resizeToSegmentCount = undefined;
        }
    }

    private updateUniformAndAttributes() {
        this.shader.uniforms[uResolution][0] = this.pixelWidth;
        this.shader.uniforms[uResolution][1] = this.pixelHeight;

        if (HAS_BROKEN_VERTEX_ID) {
            this.geometry.getBuffer(aVertexID).update(getIncreasedFloat32Array(this.pixelWidth));
        }
    }

    private execResize(segmentCount: number): void {
        this.segmentCount = segmentCount;
        this.pixelHeight = computeTextureHeight(this.segmentSize, this.segmentCount);

        const renderer = this.renderer;
        // save old texture data to new texture(sprite)
        const prevRenderTexture = this.renderTexture;
        const texture = new Texture(prevRenderTexture.castToBaseTexture());
        const sprite = new Sprite(texture);

        // create renderTexture with new size
        this.renderTexture = createRenderTexture(this.pixelWidth, this.pixelHeight);

        // copy saved texture to new renderTexture
        renderer.gl.disable(renderer.gl.BLEND);
        renderer.render(sprite, {
            renderTexture: this.renderTexture,
            clear: false,
            skipUpdateTransform: true,
        });
        renderer.gl.enable(renderer.gl.BLEND);

        // remove old texture from GPU
        prevRenderTexture.destroy(true);
        texture.destroy();
        sprite.destroy();

        this.updateUniformAndAttributes();
    }

    private tryExecWriteToTexture() {
        if (this.writableData.length > 0) {
            this.execWriteToTexture();
            this.writableData.length = 0;
        }
    }

    private execWriteToTexture(renderer: Renderer = this.renderer): void {
        const { writableData, geometry, segmentSize } = this;
        const { uniforms } = this.shader;

        renderer.renderTexture.bind(this.renderTexture);
        renderer.gl.disable(renderer.gl.BLEND);

        for (let i = 0; i < writableData.length; i++) {
            const { segmentX, segmentY, offset, source } = writableData[i];

            // SOURCE MUST BE Float32Array, restriction for webgl
            geometry.getBuffer(aValues).update(source);
            uniforms[uStartPosition][0] = segmentX * segmentSize + offset / VALUES_PER_PIXEL;
            uniforms[uStartPosition][1] = segmentY;

            renderer.shader.bind(this.shader);
            renderer.geometry.bind(this.geometry);
            renderer.geometry.draw(DRAW_MODES.POINTS, source.length / VALUES_PER_PIXEL, 0);
        }

        renderer.gl.enable(renderer.gl.BLEND);
        renderer.renderTexture.bind();
    }
}

function computeTextureHeight(segmentSize: number, segmentCount: number): number {
    return Math.ceil((segmentSize * segmentCount) / MAX_TEXTURE_SIZE);
}

function createRenderTexture(width: number, height: number): RenderTexture {
    return new RenderTexture(
        new BaseRenderTexture({
            width,
            height,
            ...TEXTURE_FLOAT_OPTIONS,
        }),
    );
}

const TEXTURE_FLOAT_OPTIONS = {
    type: TYPES.FLOAT,
    format: FORMATS.RGBA,
    alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
    mipmap: MIPMAP_MODES.OFF,
    scaleMode: SCALE_MODES.NEAREST,
};

const TASK_OPTIONS = {
    delay: 1,
    times: 1,
    insertFirst: true,
};
