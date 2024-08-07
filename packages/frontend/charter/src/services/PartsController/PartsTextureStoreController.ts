import { getIncreasedArray } from '@frontend/common/src/utils/getIncreasedArray';
import type { Renderer, RenderTexture } from 'pixi.js';

import type { TPartId, TSeriesId } from '../../../lib/Parts/def';
import { TextureStore } from '../../../lib/TextureStore';
import { getState } from '../../Charter/methods';
import type { IContext } from '../../types';
import { MAX_TEXTURE_SIZE } from '../../utils/detect';
import { PartsTextureStore } from './PartsTextureStore';

export class PartsTextureStoreController {
    private readonly textureStoreIndexes: number[];

    private textureStore!: TextureStore;
    private mapIdToStoreIndex = new Map<TSeriesId, number>();
    private mapIdToPartsStore = new Map<TSeriesId, PartsTextureStore>();

    constructor(
        private ctx: IContext,
        private options?: {
            onDeletePart?: (partId: TPartId) => void;
        },
    ) {
        const { maxChartsCount, maxChartPartsCount } = getState(ctx);

        if (maxChartsCount * maxChartPartsCount > MAX_TEXTURE_SIZE ** 2) {
            throw new Error('Incorrect required texture size for keeping parts data');
        }

        this.textureStoreIndexes = getIncreasedArray(maxChartsCount).reverse();
    }

    destroy(): void {
        this.clear();
        this.textureStore?.destroy();
        this.mapIdToPartsStore.forEach((store) => store.destroy());
        this.mapIdToPartsStore.clear();
    }

    addStore(seriesId: TSeriesId): void {
        const { maxChartsCount, maxChartPartsCount } = getState(this.ctx);
        const storeIndex = this.textureStoreIndexes.pop()!;
        const availableIndexes = getIncreasedArray(maxChartPartsCount)
            .map((v) => maxChartPartsCount * storeIndex + v)
            .reverse();

        this.updateTextureStore(
            maxChartPartsCount * (maxChartsCount - this.textureStoreIndexes.length),
        );
        this.mapIdToStoreIndex.set(seriesId, storeIndex);
        this.mapIdToPartsStore.set(
            seriesId,
            new PartsTextureStore(this.ctx, this.textureStore, {
                id: seriesId,
                availableIndexes,
                onPartDelete: this.options?.onDeletePart,
            }),
        );
    }

    deleteStore(seriesId: TSeriesId): void {
        const storeIndex = this.mapIdToStoreIndex.get(seriesId);

        if (storeIndex !== undefined) {
            this.textureStoreIndexes.push(storeIndex);
            this.mapIdToStoreIndex.delete(seriesId);
        }

        const partsStore = this.mapIdToPartsStore.get(seriesId);

        if (partsStore !== undefined) {
            partsStore.destroy();
            this.mapIdToPartsStore.delete(seriesId);
        }
    }

    getPartsTextureStore(seriesId: TSeriesId): undefined | PartsTextureStore {
        return this.mapIdToPartsStore.get(seriesId);
    }

    getTextureStore(): TextureStore {
        return this.textureStore;
    }

    getRenderTexture(): RenderTexture {
        return this.textureStore.renderTexture;
    }

    clear(): void {
        this.textureStoreIndexes.length = 0;
        this.mapIdToPartsStore.forEach((store) => store.clear());
        this.mapIdToStoreIndex.clear();
    }

    private updateTextureStore(segmentsCount: number): void {
        const { maxPartSize } = getState(this.ctx);

        if (this.textureStore === undefined) {
            this.textureStore = new TextureStore(
                this.ctx.sharedRenderer.renderer as Renderer,
                maxPartSize,
                segmentsCount,
            );
        } else {
            this.textureStore.resize(
                // We can't decrease texture size, cause we will lost some parts data
                Math.max(this.textureStore.segmentCount, segmentsCount),
            );
        }
    }
}
