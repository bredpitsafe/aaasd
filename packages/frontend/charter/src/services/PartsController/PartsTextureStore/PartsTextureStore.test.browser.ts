import type { Someseconds } from '@common/types';
import { getRandomFloat64, getRandomIntInclusive } from '@common/utils';
import type { TPoint } from '@frontend/common/src/types/shape';
import { getIncreasedArray } from '@frontend/common/src/utils/getIncreasedArray';
import { packRGBA } from '@frontend/common/src/utils/packRGBA';
import { expect } from 'chai';
import { Renderer } from 'pixi.js';

import type {
    TNormalizedPartInterval,
    TPart,
    TPartPointBuffer,
    TSeriesId,
} from '../../../../lib/Parts/def';
import { POINT_ITEM_SIZE } from '../../../../lib/Parts/def';
import { createPartBuffer } from '../../../../lib/Parts/utils/part';
import { TextureStore } from '../../../../lib/TextureStore';
import type { IContext } from '../../../types';
import { MAX_TEXTURE_SIZE } from '../../../utils/detect';
import { readPixels } from '../../../utils/Pixi/readPixels';
import { PartsTextureStore } from './index';

const PART_SIZE = 256;
const ARRAY_LENGTH = PART_SIZE * POINT_ITEM_SIZE;
const MAX_COUNT_PARTS = MAX_TEXTURE_SIZE / PART_SIZE;
const now = 0; // "now" can have any value
const sec100 = 100 * 1000;
const createArray = (dur: number): TPartPointBuffer => {
    return createPartBuffer(
        new Array(ARRAY_LENGTH).fill(1).map((v, i) => {
            // x
            if (i % 4 === 0) {
                return Math.round((dur * i) / ARRAY_LENGTH);
            }
            // y
            if (i % 4 === 1) {
                return getRandomFloat64();
            }
            // color
            if (i % 4 === 2) {
                return packRGBA(255, 0, 0, 255);
            }
            // width
            return getRandomIntInclusive(1, 10);
        }),
    );
};
const fixedArray = createArray(sec100);
const seriesId = '123' as TSeriesId;

describe('PartsTextureStore', () => {
    // eslint-disable-next-line no-console
    const error = console.error;

    let renderer: Renderer;
    let textureStore: TextureStore;
    let store: PartsTextureStore;

    beforeEach(() => {
        // ignore huge array inside console error
        // eslint-disable-next-line no-console
        console.error = (v) => error(v);
        renderer = new Renderer();
        textureStore = new TextureStore(renderer, ARRAY_LENGTH, MAX_COUNT_PARTS);
        store = new PartsTextureStore(
            { state: { __states__: {} } } as unknown as IContext,
            textureStore,
            {
                id: 'test',
                availableIndexes: getIncreasedArray(MAX_COUNT_PARTS),
            },
        );
    });

    afterEach(() => {
        store.destroy();
        textureStore.destroy();
        renderer.destroy();
        // eslint-disable-next-line no-console
        console.error = error;
    });

    it('Should create some parts', async () => {
        const parts = new Array(4).fill(0).map((_, i) => {
            const t = now + sec100 * i;
            return store.createPart({
                seriesId: seriesId,
                interval: <TNormalizedPartInterval>[t, t + sec100],
                pixelSize: <Someseconds>1,
                unresolved: false,
                size: PART_SIZE,
                buffer: createPartBuffer(createArray(sec100)),
            });
        });

        await new Promise((r) => setTimeout(r, 16));
        const pixels = readPixels(renderer, textureStore.renderTexture);

        parts.forEach((part) => {
            randomCheckPartWrite(pixels, part, store.getTextureCoord(part.id)!);
        });
    });

    it('Should update part items', async () => {
        const firstArr = createArray(1000);
        const secondArr = createArray(2000);
        const part = store.createPart({
            seriesId: seriesId,
            interval: <TNormalizedPartInterval>[now, now + sec100],
            pixelSize: <Someseconds>1,
            unresolved: false,
            size: PART_SIZE,
            buffer: firstArr,
        });

        store.updatePart(part.id, { buffer: secondArr, bufferOffset: 0 });

        await new Promise((r) => setTimeout(r, 16));

        randomCheckPartWrite(
            readPixels(renderer, textureStore.renderTexture),
            part,
            store.getTextureCoord(part.id)!,
        );
    });

    it('Should get parts for time range', () => {
        const parts = new Array(4).fill(0).map((_, i) => {
            const t = now + sec100 * i;
            return store.createPart({
                seriesId: seriesId,
                interval: <TNormalizedPartInterval>[t, t + sec100],
                pixelSize: <Someseconds>1,
                unresolved: false,
                size: PART_SIZE,
                buffer: fixedArray,
            });
        });

        const intervalParts = store.getParts(
            now + sec100 + 1,
            now + sec100 * 3 - 1,
            -Infinity as Someseconds,
            +Infinity as Someseconds,
        );

        intervalParts.forEach((part, i) => {
            expect(parts[i + 1]).equal(part);
        });
    });

    it('Should correct free up place for new parts', () => {
        // First part will have min relevance
        const parts = new Array(MAX_COUNT_PARTS).fill(0).map((_, i) => {
            const t = now + sec100 * i;
            return store.createPart({
                seriesId: seriesId,
                interval: <TNormalizedPartInterval>[t, t + sec100],
                pixelSize: <Someseconds>1,
                unresolved: false,
                size: PART_SIZE,
                buffer: fixedArray,
            });
        });

        expect(store.getSize()).equal(MAX_COUNT_PARTS);

        const lastPart = store.createPart({
            seriesId: seriesId,
            interval: <TNormalizedPartInterval>[
                now + sec100 * MAX_COUNT_PARTS,
                now + sec100 * MAX_COUNT_PARTS + 1,
            ],
            pixelSize: <Someseconds>1,
            unresolved: false,
            size: PART_SIZE,
            buffer: fixedArray,
        });

        expect(store.getSize()).equal(MAX_COUNT_PARTS);
        expect(store.hasPart(parts[0].id)).false;
        expect(store.hasPart(lastPart.id)).true;
    });

    it('Should correct free up place for new parts after getting old parts', () => {
        const parts = new Array(MAX_COUNT_PARTS).fill(0).map((_, i) => {
            const t = now + sec100 * i;
            return store.createPart({
                seriesId: seriesId,
                interval: <TNormalizedPartInterval>[t, t + sec100],
                pixelSize: <Someseconds>1,
                unresolved: false,
                size: PART_SIZE,
                buffer: fixedArray,
            });
        });

        // get min relevance part = make him max relevant
        store.updateRelevance([parts[0]]);

        let t = now + sec100 * MAX_COUNT_PARTS;
        const part21 = store.createPart({
            seriesId: seriesId,
            interval: <TNormalizedPartInterval>[t, t + sec100],
            pixelSize: <Someseconds>1,
            unresolved: false,
            size: PART_SIZE,
            buffer: fixedArray,
        });

        expect(store.getSize()).equal(MAX_COUNT_PARTS);
        expect(store.hasPart(parts[0].id)).true;
        expect(store.hasPart(parts[1].id)).false;
        expect(store.hasPart(part21.id)).true;
        // Cause we replace second at part21
        expect(store.getTextureIndex(part21.id)).equal(store.getTextureIndex(parts[1].id));

        t = now + sec100 * (MAX_COUNT_PARTS + 1);
        const part22 = store.createPart({
            seriesId: seriesId,
            interval: <TNormalizedPartInterval>[t, t + sec100],
            pixelSize: <Someseconds>1,
            unresolved: false,
            size: PART_SIZE,
            buffer: fixedArray,
        });

        expect(store.getSize()).equal(MAX_COUNT_PARTS);
        expect(store.hasPart(parts[0].id)).true;
        expect(store.hasPart(part22.id)).true;
        expect(store.hasPart(parts[2].id)).false;
        // Cause we replace third at part22
        expect(store.getTextureIndex(part22.id)).equal(store.getTextureIndex(parts[2].id));
    });
});

// Why random? Cause its doesnt have sense check every cell
function randomCheckPartWrite(pixels: Float32Array, part: TPart, texCoord: TPoint): void {
    const startIndex =
        texCoord.y * MAX_TEXTURE_SIZE * POINT_ITEM_SIZE + texCoord.x * POINT_ITEM_SIZE;
    const randomIndexes = new Float32Array(100).map(() => {
        return Math.round(Math.random() * (part.buffer.length - 1));
    });

    randomIndexes.forEach((index) => {
        index -= index % POINT_ITEM_SIZE;

        expect(pixels[startIndex + index]).equal(
            // Webgl work only with float32
            new Float32Array([part.buffer[index]])[0],
        );
        expect(pixels[startIndex + index + 1]).equal(
            // Webgl work only with float32
            new Float32Array([part.buffer[index + 1]])[0],
        );
        expect(pixels[startIndex + index + 2]).equal(
            // Webgl work only with float32
            new Float32Array([part.buffer[index + 2]])[0],
        );
        expect(pixels[startIndex + index + 3]).equal(
            // Webgl work only with float32
            new Float32Array([part.buffer[index + 3]])[0],
        );
    });
}
