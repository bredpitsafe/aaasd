import type { Someseconds } from '@common/types';
import type { TraceId } from '@common/utils';
import { minus, mul } from '@common/utils';
import { loggerCharter } from '@frontend/common/src/utils/Tracing/Children/Charter';
import hash from 'hash-sum';
import type { Observable } from 'rxjs';
import { combineLatest, EMPTY, exhaustMap, from, interval, switchMap } from 'rxjs';
import { catchError, debounceTime, filter, groupBy, map, mergeMap } from 'rxjs/operators';

import type {
    TNormalizedPartInterval,
    TPart,
    TPartInterval,
    TSeriesId,
} from '../../../lib/Parts/def';
import { getState } from '../../Charter/methods';
import type { IContext } from '../../types';
import { flatten } from '../../utils/flatten';
import { normalizeInterval } from '../../utils/interval';
import { getBiggerPixelSize, getSuitablePixelSize } from '../../utils/PixelSizes/utils';
import { GROUP_TTL } from './defs';

type TViewportVectorDirection = [0 | 1 | -1, 0 | 1 | -1];

export function createPreloadController$(
    ctx: IContext,
    loadPart$: (part: TPart, traceId: TraceId) => Observable<unknown>,
    findMissedIntervals: (
        seriesId: TSeriesId,
        interval: TPartInterval,
        pixelSize: Someseconds,
    ) => TPartInterval[],
): Observable<unknown> {
    let prevDirectionData = {
        left: 0,
        scale: 0,
    };

    return combineLatest([
        ctx.tickerController.isStarted$(),
        ctx.focusController.isFocusedApp$,
    ]).pipe(
        switchMap(([started, isFocusedApp]) => (started && isFocusedApp ? interval(100) : EMPTY)),
        filter(() => ctx.viewportController.isVisible()),
        map(() => computeDirectionVector()),
        filter((dir) => dir[0] !== 0 || dir[1] !== 0),
        mergeMap((dirVec) => {
            const addDir = (id: TSeriesId) => [id, dirVec] as [TSeriesId, TViewportVectorDirection];
            return from(ctx.chartsController.getVisibleChartsIds().map(addDir));
        }),
        map((data) => computeIntervalsData(data)),
        mergeMap((intervalsData) => {
            return from(intervalsData.intervals).pipe(
                map((interval) => ({
                    seriesId: intervalsData.seriesId,
                    pixelSize: intervalsData.pixelSize,
                    interval,
                })),
            );
        }),
        groupBy(
            (intervalData) => {
                return hash([
                    intervalData.seriesId,
                    intervalData.pixelSize,
                    ...intervalData.interval,
                ]);
            },
            { duration: debounceTime(GROUP_TTL) },
        ),
        mergeMap((group$) =>
            group$.pipe(
                exhaustMap(({ seriesId, pixelSize, interval }) => {
                    const part = ctx.partsController.createPart({
                        seriesId,
                        interval,
                        pixelSize,
                    });

                    loggerCharter.trace(`preload missed intervals`, { traceId: part.id });

                    return loadPart$(part, part.id).pipe(catchError(() => EMPTY));
                }),
            ),
        ),
    );

    function computeIntervalsData([seriesId, dirVector]: [TSeriesId, TViewportVectorDirection]): {
        seriesId: TSeriesId;
        intervals: TPartInterval[];
        pixelSize: Someseconds;
    } {
        const preloadIntervals: TNormalizedPartInterval[] = [];
        const { chartsController, viewport } = ctx;
        const { pixelSizes, requestedPixelsCount, clientTimeIncrement } = getState(ctx);
        const left = clientTimeIncrement + viewport.getLeft();
        const right = clientTimeIncrement + viewport.getRight();

        const chartProps = chartsController.getChartProps(seriesId);
        const hasFixedZoom = chartProps?.fixedZoom !== undefined;
        const ps = (1 / (chartProps?.fixedZoom ?? viewport.scale.x)) as Someseconds;
        let pixelSize = getSuitablePixelSize(ps, pixelSizes);
        const interval = normalizeInterval(
            <TPartInterval>[left, right],
            mul(requestedPixelsCount, pixelSize),
        );
        const durationGap = minus(interval[1], interval[0]) * 0.15;

        if (dirVector[0] === 1 && interval[1] - right > 0 && interval[1] - right < durationGap) {
            preloadIntervals.push(getIntervalRighter(interval[1], pixelSize));
        }

        if (dirVector[0] === -1 && left - interval[0] > 0 && left - interval[0] < durationGap) {
            preloadIntervals.push(getIntervalLefter(interval[0], pixelSize));
        }

        if (!hasFixedZoom && dirVector[1] === -1 && pixelSize / ps > 1.1) {
            const furtherInterval = getIntervalFurther(<TPartInterval>[left, right], pixelSize);

            if (furtherInterval !== undefined) {
                pixelSize = furtherInterval[0];
                preloadIntervals.push(furtherInterval[1]);
            }
        }

        const missedIntervals = flatten(
            preloadIntervals.map((interval) => findMissedIntervals(seriesId, interval, pixelSize)),
        );

        return {
            seriesId,
            pixelSize,
            intervals: missedIntervals,
        };
    }

    function computeDirectionVector(): TViewportVectorDirection {
        const { viewport } = ctx;
        const { clientTimeIncrement } = getState(ctx);
        const left = clientTimeIncrement + viewport.getLeft();
        const scale = viewport.scale.x;
        const prev = prevDirectionData;

        prevDirectionData = { left, scale };

        if (scale > prev.scale) return [0, 1];
        if (scale < prev.scale) return [0, -1];
        if (left > prev.left) return [1, 0];
        if (left < prev.left) return [-1, 0];

        return [0, 0];
    }

    function getIntervalLefter(left: number, pixelSize: Someseconds): TNormalizedPartInterval {
        const { requestedPixelsCount } = getState(ctx);
        const duration = requestedPixelsCount * pixelSize;

        return normalizeInterval(
            <TPartInterval>[left - duration * 0.9, left - duration * 0.8],
            mul(requestedPixelsCount, pixelSize),
        );
    }

    function getIntervalRighter(right: number, pixelSize: Someseconds): TNormalizedPartInterval {
        const { requestedPixelsCount } = getState(ctx);
        const duration = requestedPixelsCount * pixelSize;
        return normalizeInterval(
            <TPartInterval>[right + duration * 0.8, right + duration * 0.9],
            mul(requestedPixelsCount, pixelSize),
        );
    }

    function getIntervalFurther(
        interval: TPartInterval,
        pixelSize: Someseconds,
    ): void | [Someseconds, TNormalizedPartInterval] {
        const { pixelSizes, requestedPixelsCount } = getState(ctx);
        const nextPixelSize = getBiggerPixelSize(pixelSize, pixelSizes);

        if (nextPixelSize === pixelSize) return;

        return [
            nextPixelSize,
            normalizeInterval(interval, mul(nextPixelSize, requestedPixelsCount)),
        ];
    }
}
