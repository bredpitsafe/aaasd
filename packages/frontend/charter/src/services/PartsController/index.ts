import type { Someseconds } from '@common/types';
import { getNowMilliseconds } from '@common/utils';
import type { TPoint } from '@frontend/common/src/types/shape';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { throttleFrame } from '@frontend/common/src/utils/Rx/throttleFrame';
import { isNil, sortBy } from 'lodash-es';
import type { RenderTexture } from 'pixi.js';
import { merge, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import type { TPart, TPartId, TPartInterval, TSeriesId } from '../../../lib/Parts/def';
import type { createPart } from '../../../lib/Parts/utils/part';
import { sortPartsByFirstPoint } from '../../../lib/Parts/utils/point';
import type { IContext } from '../../types';
import { flatten } from '../../utils/flatten';
import { getSuitablePixelSize } from '../../utils/PixelSizes/utils';
import { createLoaderPartsController$ } from './createLoaderPartsController$';
import type { TPartPatch } from './PartsTextureStore';
import { PartsTextureStoreController } from './PartsTextureStoreController';

const LIVE_NOTIFICATION_DELAY = 60_000;

export class PartsController {
    private readonly partsTextureStoreController: PartsTextureStoreController;

    private readonly mapIdToVisibleParts = new Map<TSeriesId, TPart[]>();
    private readonly mapIdToLastSeenParts = new Map<TSeriesId, TPart[]>();

    private readonly loaderPartsController?: ReturnType<typeof createLoaderPartsController$>;

    private readonly destroy$ = new Subject<void>();
    private readonly partsChanged$ = new Subject<void>();

    constructor(private ctx: IContext) {
        this.partsTextureStoreController = new PartsTextureStoreController(ctx);

        merge(ctx.tickerController.getTicker$(), this.partsChanged$)
            .pipe(
                filter(() => ctx.viewportController.isVisible()),
                throttleFrame(20),
                takeUntil(this.destroy$),
            )
            .subscribe(() => this.updateVisibleParts());

        if (ctx.partsLoader !== undefined) {
            // TODO: move to separate controller
            this.loaderPartsController = createLoaderPartsController$(ctx);
            this.loaderPartsController
                .startLoadingParts$()
                .pipe(takeUntil(this.destroy$))
                .subscribe();
        }
    }

    destroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        this.mapIdToVisibleParts.clear();
        this.mapIdToLastSeenParts.clear();
        this.partsTextureStoreController.destroy();
        this.loaderPartsController?.loadablePartsTree?.clear();
    }

    readonly addPartsStore = (seriesId: TSeriesId): void => {
        this.partsTextureStoreController.addStore(seriesId);
    };

    readonly deletePartsStore = (seriesId: TSeriesId): void => {
        this.partsTextureStoreController.deleteStore(seriesId);
        this.mapIdToVisibleParts.delete(seriesId);
        this.mapIdToLastSeenParts.delete(seriesId);
    };

    readonly getStoreRenderTexture = (): RenderTexture => {
        return this.partsTextureStoreController.getRenderTexture();
    };

    readonly getStoreTextureCoord = (seriesId: TSeriesId, partId: TPartId): undefined | TPoint => {
        return this.partsTextureStoreController
            .getPartsTextureStore(seriesId)
            ?.getTextureCoord(partId);
    };

    readonly getParts = (
        seriesId: TSeriesId,
        timeStart: number,
        timeEnd: number,
        pixelSizeMin: Someseconds,
        pixelSizeMax?: Someseconds,
    ): TPart[] => {
        return (
            this.partsTextureStoreController
                .getPartsTextureStore(seriesId)!
                .getParts(timeStart, timeEnd, pixelSizeMin, pixelSizeMax ?? pixelSizeMin) ||
            EMPTY_ARRAY
        );
    };

    readonly hasPart = (part: TPart): boolean => {
        return (
            this.partsTextureStoreController
                .getPartsTextureStore(part.seriesId)
                ?.hasPart(part.id) ?? false
        );
    };

    readonly createPart = (params: Parameters<typeof createPart>[0]): TPart => {
        return this.partsTextureStoreController
            .getPartsTextureStore(params.seriesId)!
            .createPart(params);
    };

    readonly updatePart = (part: TPart, patch: TPartPatch): void => {
        this.partsTextureStoreController
            .getPartsTextureStore(part.seriesId)
            ?.updatePart(part.id, patch);

        this.partsChanged$.next();
    };

    readonly getActualParts = (seriesId: TSeriesId): TPart[] => {
        return this.mapIdToVisibleParts.get(seriesId) || (EMPTY_ARRAY as TPart[]);
    };

    readonly getVisiblePartsUnsorted = (seriesId: TSeriesId): TPart[] => {
        const actual = this.getActualParts(seriesId);
        const lastSeen = this.mapIdToLastSeenParts.get(seriesId);

        return actual.length > 0 || lastSeen === undefined ? actual : lastSeen;
    };

    readonly getVisibleParts = (seriesId: TSeriesId): TPart[] => {
        return sortPartsByFirstPoint(this.getVisiblePartsUnsorted(seriesId));
    };

    readonly getAllVisibleParts = (): TPart[] => flatten(this.getAllVisiblePartsByChart());

    readonly getLastVisibleParts = (): TPart[] =>
        this.getAllVisiblePartsByChart()
            .map(
                (visibleChartParts) =>
                    sortBy(visibleChartParts, ({ interval: [, end] }) => end)?.at(-1),
            )
            .filter((lastPart): lastPart is TPart => !isNil(lastPart));

    private readonly getAllVisiblePartsByChart = (): TPart[][] =>
        this.ctx.chartsController.getVisibleChartsIds().map(this.getVisiblePartsUnsorted);

    readonly getLiveParts = (seriesId: TSeriesId): TPart[] => {
        return (this.mapIdToVisibleParts.get(seriesId) || EMPTY_ARRAY).filter(selectLivePart);
    };

    readonly getAllLiveParts = (): TPart[] => {
        return flatten(this.ctx.chartsController.getVisibleChartsIds().map(this.getLiveParts));
    };

    readonly getFailedParts = (seriesId: TSeriesId): TPart[] => {
        return (this.mapIdToVisibleParts.get(seriesId) || EMPTY_ARRAY).filter(selectFailedPart);
    };

    readonly getAllFailedParts = (): TPart[] => {
        return flatten(this.ctx.chartsController.getVisibleChartsIds().map(this.getFailedParts));
    };

    readonly getLoadableIntervals = (seriesId: TSeriesId): TPartInterval[] => {
        const {
            viewport,
            state: { clientTimeIncrement },
        } = this.ctx;
        const left = viewport.getLeft();
        const right = viewport.getRight();
        const pixelSize = this.getNearestPixelSize(seriesId);

        return (
            this.loaderPartsController?.loadablePartsTree
                .find(clientTimeIncrement + left, clientTimeIncrement + right, pixelSize, pixelSize)
                .filter(
                    (part) =>
                        part.seriesId === seriesId &&
                        (part.unresolved !== 'live' ||
                            getNowMilliseconds() - part.tsUpdate > LIVE_NOTIFICATION_DELAY),
                )
                .map((part) => part.interval) ?? EMPTY_ARRAY
        );
    };

    readonly getAllLoadableIntervals = (): TPartInterval[] => {
        return flatten(
            this.ctx.chartsController.getVisibleChartsIds().map(this.getLoadableIntervals),
        );
    };

    readonly getFailedIntervals = (seriesId: TSeriesId): TPartInterval[] => {
        return this.getFailedParts(seriesId).map((part) => part.interval);
    };

    readonly getAllFailedIntervals = (): TPartInterval[] => {
        return flatten(
            this.ctx.chartsController.getVisibleChartsIds().map(this.getFailedIntervals),
        );
    };

    readonly getNearestPixelSize = (seriesId: TSeriesId): Someseconds => {
        const {
            viewport,
            chartsController,
            state: { pixelSizes },
        } = this.ctx;
        const chartProps = chartsController.getChartProps(seriesId);

        return getSuitablePixelSize(
            (1 / (chartProps?.fixedZoom ?? viewport.scale.x)) as Someseconds,
            pixelSizes,
        );
    };

    clear() {
        this.mapIdToVisibleParts.clear();
        this.mapIdToLastSeenParts.clear();
        this.loaderPartsController?.loadablePartsTree?.clear();
        this.partsTextureStoreController.clear();
    }

    private readonly updateVisibleParts = (): void => {
        const ids = this.ctx.chartsController.getVisibleChartsIds();

        for (const id of ids) {
            const parts = this.mapIdToVisibleParts.get(id);

            if (parts !== undefined && parts.length > 0 && parts.some((p) => p.size > 0)) {
                this.mapIdToLastSeenParts.set(id, parts);
            }
        }

        this.mapIdToVisibleParts.clear();

        for (const id of ids) {
            this.updateChart(id);
        }
    };

    private readonly updateChart = (seriesId: TSeriesId): void => {
        const parts = this.getActualViewportData(seriesId);

        this.partsTextureStoreController.getPartsTextureStore(seriesId)?.updateRelevance(parts);
        this.mapIdToVisibleParts.set(seriesId, parts);
    };

    private readonly getActualViewportData = (seriesId: TSeriesId): TPart[] => {
        const {
            viewport,
            partsController,
            state: { clientTimeIncrement },
        } = this.ctx;
        const left = viewport.getLeft();
        const right = viewport.getRight();
        const absLeft = clientTimeIncrement + left;
        const absRight = clientTimeIncrement + right;
        const pixelSize = this.getNearestPixelSize(seriesId);

        return partsController.getParts(seriesId, absLeft, absRight, pixelSize);
    };
}

const selectLivePart = (p: TPart) => p.unresolved === 'live';
const selectFailedPart = (p: TPart) => p.unresolved === 'failed';
