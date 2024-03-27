import type { Someseconds } from '@frontend/common/src/types/time';
import { mul, plus } from '@frontend/common/src/utils/math';
import { finalizeOnlyWithError } from '@frontend/common/src/utils/Rx/finalize';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { loggerCharter } from '@frontend/common/src/utils/Tracing/Children/Charter';
import {
    combineLatest,
    EMPTY,
    exhaustMap,
    from,
    interval,
    merge,
    mergeMap,
    Observable,
    switchMap,
} from 'rxjs';
import { catchError, debounceTime, filter, finalize, groupBy, map, tap } from 'rxjs/operators';

import type { TPart, TPartInterval, TPartItemsData, TSeriesId } from '../../../lib/Parts/def';
import { POINT_ITEM_SIZE } from '../../../lib/Parts/def';
import { PartsTree } from '../../../lib/Parts/PartsTree';
import { createPart, splitItemsDataForParts } from '../../../lib/Parts/utils/part';
import { getLastAbsPointTime } from '../../../lib/Parts/utils/point';
import { getState } from '../../Charter/methods';
import type { IContext } from '../../types';
import { getMissedIntervals, normalizeInterval } from '../../utils/interval';
import { createClosestPointsController$ } from './createClosestPointsController$';
import { createFailedPartsController$ } from './createFailedPartsController$';
import { createLivePartsController$ } from './createLivePartsController$';
import { createPreloadController$ } from './createPreloadController$';
import { GROUP_TTL } from './defs';

export function createLoaderPartsController$(ctx: IContext): {
    startLoadingParts$: () => Observable<unknown>;
    loadablePartsTree: PartsTree<TPart>;
} {
    const loadablePartsTree = new PartsTree();

    return {
        startLoadingParts$: () => {
            return merge(
                intervalUpload$(),
                createLivePartsController$(ctx, fillPart$),
                createFailedPartsController$(ctx, fillPart$),
                createPreloadController$(ctx, fillPart$, findMissedIntervals),
                createClosestPointsController$(ctx),
            ).pipe(
                finalize(() => {
                    loadablePartsTree.clear();
                }),
            );
        },
        loadablePartsTree,
    };

    function intervalUpload$(): Observable<unknown> {
        return combineLatest([
            ctx.tickerController.isStarted$(),
            ctx.focusController.isFocusedApp$,
        ]).pipe(
            switchMap(([started, isFocusedApp]) =>
                started ? interval(isFocusedApp ? 250 : 500) : EMPTY,
            ),
            filter(() => ctx.viewportController.isVisible()),
            mergeMap(() => from(ctx.chartsController.getVisibleChartsIds())),
            groupBy((seriesId) => seriesId, {
                duration: ({ key }) =>
                    ctx.chartsController.deleteChartId$.pipe(filter((id) => id === key)),
            }),
            mergeMap((seriesId$) =>
                seriesId$.pipe(
                    map((seriesId) => getActualMissedIntervalsData(seriesId)),
                    mergeMap(({ seriesId, pixelSize, intervals }) =>
                        from(intervals).pipe(
                            map((interval) => ({
                                seriesId,
                                pixelSize,
                                interval,
                            })),
                        ),
                    ),
                    groupBy(
                        ({ seriesId, pixelSize, interval }) =>
                            `${seriesId}-${pixelSize}-${interval.toString()}`,
                        { duration: debounceTime(GROUP_TTL) },
                    ),
                    mergeMap((data$) => {
                        return data$.pipe(
                            exhaustMap(({ seriesId, pixelSize, interval }) => {
                                const part = createPart({
                                    seriesId,
                                    interval,
                                    pixelSize,
                                });

                                loggerCharter.trace(`load missed interval`, { traceId: part.id });

                                return fillPart$(part, part.id).pipe(catchError(() => EMPTY));
                            }),
                        );
                    }),
                ),
            ),
        );
    }

    function findMissedIntervals(
        seriesId: TSeriesId,
        interval: TPartInterval,
        pixelSize: Someseconds,
    ): TPartInterval[] {
        const parts = getParts(seriesId, interval, pixelSize);

        return getMissedIntervals(interval, [
            ...parts,
            ...loadablePartsTree
                .find(interval[0], interval[1], pixelSize, pixelSize)
                .filter((part) => part.seriesId === seriesId),
        ]);
    }

    function getActualMissedIntervalsData(seriesId: TSeriesId) {
        const { interval, pixelSize } = getNormalizedViewportData(seriesId);
        const intervals = findMissedIntervals(seriesId, interval, pixelSize);

        return {
            seriesId,
            pixelSize,
            intervals,
        };
    }

    function getParts(
        seriesId: TSeriesId,
        interval: TPartInterval,
        pixelSize: Someseconds,
    ): TPart[] {
        return ctx.partsController.getParts(seriesId, interval[0], interval[1], pixelSize);
    }

    function getNormalizedViewportData(seriesId: TSeriesId): {
        interval: TPartInterval;
        pixelSize: Someseconds;
    } {
        const {
            viewport,
            partsController,
            state: { requestedPixelsCount, clientTimeIncrement },
        } = ctx;
        const left = viewport.getLeft();
        const right = viewport.getRight();
        const absLeft = plus(clientTimeIncrement, left);
        const absRight = plus(clientTimeIncrement, right);
        const pixelSize = partsController.getNearestPixelSize(seriesId);
        const interval = normalizeInterval(
            [absLeft, absRight],
            mul(pixelSize, requestedPixelsCount),
        ) as TPartInterval;

        return { interval, pixelSize };
    }

    function fillPart$(seedPart: TPart, traceId: TraceId): Observable<unknown> {
        const { maxPartSize } = getState(ctx);
        const timeStart = getLastAbsPointTime(seedPart) || seedPart.interval[0];
        const loadableInterval = <TPartInterval>[timeStart, seedPart.interval[1]];
        const loadablePart = createPart({
            seriesId: seedPart.seriesId,
            interval: loadableInterval,
            pixelSize: seedPart.pixelSize,
            unresolved: seedPart.unresolved,
            tsUpdate: seedPart.tsUpdate,
        });
        let lastPart: TPart = seedPart;

        loadablePartsTree.insert(loadablePart);

        loggerCharter.trace(`fillPart$`, {
            seriesId: seedPart.seriesId,
            interval: loadableInterval,
            pixelSize: seedPart.pixelSize,
            unresolved: seedPart.unresolved,
            traceId,
        });

        return ctx
            .partsLoader!.loadItemsData(
                seedPart.seriesId,
                loadableInterval,
                seedPart.pixelSize,
                maxPartSize,
                seedPart.unresolved === 'live',
                traceId,
            )
            .pipe(
                tap((data) => {
                    const { forPrevPart, forNextPart } = splitItemsDataForParts(
                        lastPart,
                        data,
                        maxPartSize * POINT_ITEM_SIZE,
                    );

                    upsertPart(lastPart, forPrevPart, traceId);

                    if (forNextPart) {
                        lastPart = createPart({
                            seriesId: lastPart.seriesId,
                            pixelSize: lastPart.pixelSize,
                            interval: forNextPart.interval,
                            tsUpdate: lastPart.tsUpdate,
                        });
                        upsertPart(lastPart, forNextPart, traceId);
                    }
                }),
                finalizeOnlyWithError((err) => {
                    loggerCharter.error(err.message, { traceId });
                    upsertPart(lastPart, { unresolved: 'failed' }, traceId);
                }),
                finalize(() => {
                    loadablePartsTree.delete(loadablePart);
                }),
            );
    }

    function upsertPart(part: TPart, data: Partial<TPartItemsData>, traceId?: TraceId): void {
        if (!ctx.partsController.hasPart(part)) {
            loggerCharter.trace(`setPart`, { traceId });
            ctx.partsController.setPart(Object.assign(part, data));
        } else if (data) {
            loggerCharter.trace(`updatePart`, { traceId });
            ctx.partsController.updatePart(part, {
                interval: data.interval,
                baseValue: data.baseValue,
                unresolved: data.unresolved,
                buffer: data.buffer,
                bufferOffset: part.buffer.length,
            });
        }
    }
}
