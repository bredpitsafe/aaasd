import type { Someseconds } from '@common/types';
import { getNowMilliseconds } from '@common/utils';
import type { TPoint } from '@frontend/common/src/types/shape';
import type { TLinkedMap } from '@frontend/common/src/utils/LinkedMap';
import { LinkedMap } from '@frontend/common/src/utils/LinkedMap';
import { loggerCharter } from '@frontend/common/src/utils/Tracing/Children/Charter';

import type { TPart, TPartId, TPartPointBuffer } from '../../../../lib/Parts/def';
import { POINT_ITEM_SIZE } from '../../../../lib/Parts/def';
import { PartsTree } from '../../../../lib/Parts/PartsTree';
import { createPart } from '../../../../lib/Parts/utils/part';
import type { TextureStore } from '../../../../lib/TextureStore';
import { createLocalState, destroyLocalState } from '../../../Charter/methods';
import type { IContext } from '../../../types';
import { replaceNaNWithWebGLNaN } from '../../../utils/WebGLNaN';

export type TPartPatch = Partial<
    Pick<
        TPart,
        | 'unresolved'
        | 'interval'
        | 'pixelSize'
        | 'baseValue'
        | 'absLeftPoint'
        | 'absRightPoint'
        | 'buffer'
    > & {
        bufferOffset: number;
    }
>;

const UPDATABLE_FIELDS = <const>[
    'unresolved',
    'interval',
    'pixelSize',
    'baseValue',
    'absLeftPoint',
    'absRightPoint',
];

export class PartsTextureStore {
    private isDestroyed = false;

    private state: {
        parts: TLinkedMap<TPartId, TPart>;
        availableIndexes: number[];
    };

    private partsTree = new PartsTree();
    private mapIdToTextureIndex = new Map<TPartId, number>();

    constructor(
        private ctx: IContext,
        private textureStore: TextureStore,
        private options: {
            id: string;
            onPartDelete?: (partId: TPartId) => void;
            availableIndexes: number[];
        },
    ) {
        this.state = createLocalState(
            ctx,
            'PartsTextureStore_' + options.id,
            (state) =>
                state ?? {
                    parts: LinkedMap.create<TPartId, TPart>(),
                    availableIndexes: options.availableIndexes,
                },
        );

        LinkedMap.forEach(this.state.parts, ({ value }) => {
            this.createPart(preparePart(value));
        });
    }

    destroy(): void {
        this.isDestroyed = true;

        this.clear();
        // @ts-ignore
        this.state = undefined;
        destroyLocalState(this.ctx, 'PartsTextureStore');
    }

    getSize(): number {
        return this.state.parts.size;
    }

    hasPart(partId: TPartId): boolean {
        return LinkedMap.hasNode(this.state.parts, partId);
    }

    getPart(partId: TPartId): undefined | TPart {
        return LinkedMap.getNodeValue(this.state.parts, partId);
    }

    createPart(params: Parameters<typeof createPart>[0]): TPart {
        const part = createPart(params);

        if (!this.mapIdToTextureIndex.has(part.id)) {
            if (this.state.availableIndexes.length === 0) {
                this.freeUpPlaceForPart(1);
            }

            const texIndex = this.state.availableIndexes.pop()!;
            this.mapIdToTextureIndex.set(part.id, texIndex);
        }

        this.setPartBuffer(part, part.buffer, 0);
        this.insertPartToTree(part);

        LinkedMap.insertFirst(this.state.parts, part.id, part);

        return part;
    }

    updatePart(partId: TPartId, partPatch: TPartPatch): void {
        if (this.isDestroyed) return;

        const part = LinkedMap.getNodeValue(this.state.parts, partId);

        if (part === undefined) {
            loggerCharter.warn('Trying update not existed part', partId, partPatch);
            return;
        }

        part.tsUpdate = getNowMilliseconds();

        for (const field of UPDATABLE_FIELDS) {
            if (partPatch[field] !== undefined) {
                // @ts-ignore
                part[field] = partPatch[field];
            }
        }

        if (partPatch.buffer) {
            this.setPartBuffer(part, partPatch.buffer, partPatch.bufferOffset ?? 0);
        }

        this.insertPartToTree(part);
    }

    deletePart(partId: TPartId): void {
        if (this.isDestroyed) return;

        this.deletePartById(partId);
    }

    getTextureIndex(partId: TPartId): number | undefined {
        return this.mapIdToTextureIndex.get(partId)!;
    }

    getTextureCoord(partId: TPartId): TPoint | undefined {
        const index = this.mapIdToTextureIndex.get(partId);
        return index !== undefined ? this.textureIndexToTextureCoord(index) : undefined;
    }

    getParts(
        timeStart: number,
        timeEnd: number,
        pixelSizeMin: Someseconds,
        pixelSizeMax?: Someseconds,
    ): TPart[] {
        return this.partsTree
            .find(timeStart, timeEnd, pixelSizeMin, pixelSizeMax ?? pixelSizeMin)
            .map(({ id }) => LinkedMap.getNodeValue(this.state.parts, id)!);
    }

    hasParts(
        timeStart: number,
        timeEnd: number,
        pixelSizeMin: Someseconds,
        pixelSizeMax?: Someseconds,
    ): boolean {
        return this.partsTree.has(timeStart, timeEnd, pixelSizeMin, pixelSizeMax ?? pixelSizeMin);
    }

    updateRelevance(parts: TPart[]): void {
        // move id to begin of the list
        for (let i = 0; i < parts.length; i++) {
            LinkedMap.removeById(this.state.parts, parts[i].id);
            LinkedMap.insertFirst(this.state.parts, parts[i].id, parts[i]);
        }
    }

    clear(): void {
        for (const key of this.mapIdToTextureIndex.keys()) {
            this.options.onPartDelete?.(key);
        }

        this.partsTree.clear();
        this.state.availableIndexes.push(...this.mapIdToTextureIndex.values());
        this.mapIdToTextureIndex.clear();
        LinkedMap.clear(this.state.parts);
    }

    private insertPartToTree(part: TPart): void {
        this.partsTree.insert(part);

        if (process.env.NODE_ENV === 'development') {
            const parts = this.partsTree.find(
                part.interval[0] + 100,
                part.interval[1] - 100,
                part.pixelSize,
                part.pixelSize,
            );

            if (parts.length > 1) {
                loggerCharter.error('Duplicated parts', parts);
            }
        }
    }

    private freeUpPlaceForPart(count = 1): void {
        const linkedList = this.state.parts;
        const availableIndexesLength = this.state.availableIndexes.length;
        const freeUpNotEnough = () =>
            this.state.availableIndexes.length - availableIndexesLength < count;

        while (freeUpNotEnough() && linkedList.tailId !== null) {
            this.deletePartById(linkedList.tailId as TPartId);
        }
    }

    private setPartBuffer(part: TPart, buffer: number[], offsetBuffer: number): void {
        if (this.isDestroyed || buffer.length === 0) return;

        const length = Math.max(part.buffer.length, buffer.length + offsetBuffer);

        if (part.buffer.length > length) {
            part.buffer.length = length;
        }

        if (buffer.length + offsetBuffer > length) {
            buffer.length = length - offsetBuffer;
        }

        const partBuffer = part.buffer;

        if (!(offsetBuffer === 0 && part.buffer === buffer)) {
            for (let i = 0; i < buffer.length; i++) {
                partBuffer[offsetBuffer + i] = buffer[i];
            }
        }

        const patch = extractTexturePatch(partBuffer, offsetBuffer, buffer.length, POINT_ITEM_SIZE);
        this.writePartBufferToTexture(part.id, patch.buffer, patch.offset);

        part.buffer = partBuffer;
        part.size = partBuffer.length / POINT_ITEM_SIZE;
    }

    private writePartBufferToTexture(partId: TPartId, buffer: Float32Array, offsetBuffer: number) {
        const coord = this.textureIndexToSegmentCoord(this.mapIdToTextureIndex.get(partId)!);
        this.textureStore.scheduleWriteToTexture(coord.x, coord.y, offsetBuffer, buffer);
    }

    private deletePartById(id: TPartId): void {
        const part = LinkedMap.getNodeValue(this.state.parts, id);

        if (part !== undefined) {
            this.partsTree.delete(part);
            LinkedMap.removeById(this.state.parts, id);
            this.options.onPartDelete?.(id);
        }

        const texIndex = this.mapIdToTextureIndex.get(id);

        if (texIndex !== undefined) {
            this.state.availableIndexes.push(texIndex);
        }
    }

    private textureIndexToSegmentCoord(index: number): TPoint {
        const { pixelWidth, segmentSize } = this.textureStore;
        const rowSegmentCount = Math.ceil(pixelWidth / segmentSize);

        const x = index % rowSegmentCount;
        const y = Math.floor(index / rowSegmentCount);

        return { x, y };
    }

    private textureIndexToTextureCoord(index: number): TPoint {
        const { segmentSize } = this.textureStore;
        const coord = this.textureIndexToSegmentCoord(index);

        coord.x = coord.x * segmentSize;

        return coord;
    }
}

function extractTexturePatch(
    buffer: TPartPointBuffer,
    offset: number,
    length: number,
    itemSize: number,
): { offset: number; buffer: Float32Array } {
    const shiftStart = offset % itemSize;
    const shiftEnd = (shiftStart + length) % itemSize;
    const start = offset - shiftStart;
    const end = offset + length + shiftEnd;
    const len = end - start;
    const newBuffer = new Float32Array(len);

    newBuffer.set(buffer.slice(start, end));

    replaceNaNWithWebGLNaN(newBuffer);

    return { offset: start, buffer: newBuffer };
}

function preparePart(part: TPart): TPart {
    for (let i = 0; i < part.buffer.length; i++) {
        if (part.buffer[i] === null) {
            part.buffer[i] = NaN;
        }
    }

    return part;
}
