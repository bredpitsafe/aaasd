import type { Someseconds } from '@common/types';
import { minus, plus } from '@common/utils';
import { loggerCharter } from '@frontend/common/src/utils/Tracing/Children/Charter';
import Enumerable from 'linq';
import { isNil, isUndefined } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest, EMPTY, exhaustMap, from, interval, merge, mergeMap, switchMap } from 'rxjs';
import { catchError, debounceTime, filter, finalize, groupBy, map, tap } from 'rxjs/operators';

import type { TPart, TPartClosestAbsPoint, TPartId, TSeriesId } from '../../../lib/Parts/def';
import {
    getFirstAbsPoint,
    getLastAbsPoint,
    sortPartsByFirstPoint,
    sortPartsByLastPoint,
} from '../../../lib/Parts/utils/point';
import { EChartType } from '../../components/Chart/defs';
import type { IContext } from '../../types';
import { flatten } from '../../utils/flatten';
import { EPointSide } from '../PartsLoader';
import { DELAYED_EMPTY, GROUP_TTL } from './defs';

export function createClosestPointsController$(ctx: IContext): Observable<unknown> {
    const loadableParts = new Set<TPartId>();

    const uploadClosestPoints$ = combineLatest([
        ctx.tickerController.isStarted$(),
        ctx.focusController.isFocusedWindow$,
    ]).pipe(
        switchMap(([started, focused]) => (started ? interval(focused ? 100 : 1000) : EMPTY)),
        filter(() => ctx.viewportController.isVisible()),
        map(() => flatten(ctx.chartsController.getVisibleChartsIds().map(getSuitableDataParts))),
        mergeMap((data) => from(data)),
        groupBy((data) => `${data.part.id}/${data.side}`, {
            duration: debounceTime(GROUP_TTL),
        }),
        mergeMap((group$) =>
            group$.pipe(
                exhaustMap((data: { part: TPart; side: EPointSide }) =>
                    loadPoint(data.part, data.side).pipe(
                        map((point) => ({ data, point })),
                        catchError(() => DELAYED_EMPTY),
                    ),
                ),
            ),
        ),
        tap(({ data: { side, part }, point }) => {
            const key: keyof Pick<TPart, 'absLeftPoint' | 'absRightPoint'> =
                side === EPointSide.Left ? 'absLeftPoint' : 'absRightPoint';

            ctx.partsController.updatePart(part, {
                [key]: point,
            });
        }),
        finalize(() => {
            loadableParts.clear();
        }),
    );

    const computeClosestPoints$ = combineLatest([
        ctx.tickerController.isStarted$(),
        ctx.focusController.isFocusedWindow$,
    ]).pipe(
        switchMap(([started, focused]) =>
            started && focused ? ctx.tickerController.getTicker$() : EMPTY,
        ),
        filter(() => ctx.viewportController.isVisible()),
        map(() =>
            ctx.chartsController
                .getVisibleChartsIds()
                .map((id) => ctx.partsController.getVisibleParts(id)),
        ),
        mergeMap((nestedParts) => from(nestedParts)),
        filter((parts) => parts.length > 0),
        tap((parts) => {
            const left = getSuitableLeftPart(parts);
            const right = getSuitableRightPart(parts);

            !isUndefined(left) && tryUpdateLeftClosestPoint(left);
            !isUndefined(right) && tryUpdateRightClosestPoint(right);
        }),
    );

    return merge(computeClosestPoints$, uploadClosestPoints$);

    function getSuitableDataParts<
        T extends {
            part: TPart;
            side: EPointSide;
        },
    >(id: TSeriesId): T[] {
        const result: T[] = [];
        const parts = ctx.partsController.getVisibleParts(id);

        if (parts.length === 0) return result;

        const left = getSuitableLeftPart(parts);
        const right = getSuitableRightPart(parts);

        if (!isUndefined(left)) {
            result.push(<T>{
                side: EPointSide.Left,
                part: left,
            });
        }

        if (!isUndefined(right)) {
            result.push(<T>{
                side: EPointSide.Right,
                part: right,
            });
        }

        return result;
    }

    function getSuitableLeftPart(parts: TPart[]): undefined | TPart {
        const part = sortPartsByFirstPoint(parts)[0];
        const chartProps = ctx.chartsController.getChartProps(part.seriesId);

        if (loadableParts.has(part.id) || chartProps === undefined) {
            return undefined;
        }

        const suitableChartType = chartProps.type !== EChartType.points;
        const isSuite = suitableChartType && part.absLeftPoint === undefined;

        return isSuite ? part : undefined;
    }

    function getSuitableRightPart(parts: TPart[]): undefined | TPart {
        const sortedParts = sortPartsByLastPoint(parts);
        const part = sortedParts[parts.length - 1];
        const chartProps = ctx.chartsController.getChartProps(part.seriesId);

        if (loadableParts.has(part.id) || chartProps === undefined) {
            return undefined;
        }

        const suitableChartType = chartProps.type === EChartType.lines;
        const isSuite =
            suitableChartType && part.unresolved === false && part.absRightPoint === undefined;

        return isSuite ? part : undefined;
    }

    function tryUpdateLeftClosestPoint(part: TPart): void {
        if (!isUndefined(part.absLeftPoint)) return;

        const point = computeLeftClosestPoint(part);

        if (isUndefined(point)) return;

        ctx.partsController.updatePart(part, {
            absLeftPoint: point,
        });
    }
    function tryUpdateRightClosestPoint(part: TPart): void {
        if (!isUndefined(part.absRightPoint)) return;

        const point = computeRightClosestPoint(part);

        if (isUndefined(point)) return;

        ctx.partsController.updatePart(part, {
            absRightPoint: point,
        });
    }

    function computeLeftClosestPoint(part: TPart): TPart['absLeftPoint'] {
        const getParts = ctx.partsController.getParts.bind(ctx.partsController, part.seriesId);
        const suitableLeftPart = Enumerable.from(partTraverseToLeftSide(getParts, part))
            .takeWhile((part) => part.unresolved === false)
            .where((part) => part.size > 0 || !isUndefined(part.absLeftPoint))
            .firstOrDefault(undefined);

        const suitableRightPart =
            suitableLeftPart === undefined && part.size === 0
                ? Enumerable.from(partTraverseToRightSide(getParts, part))
                      .takeWhile(
                          (p) => !isNil(p.absLeftPoint) || (p.unresolved === false && p.size === 0),
                      )
                      .where((p) => {
                          return !isNil(p.absLeftPoint) && p.absLeftPoint.x < part.interval[0];
                      })
                      .firstOrDefault(undefined)
                : undefined;

        return suitableLeftPart
            ? suitableLeftPart.size === 0
                ? suitableLeftPart.absLeftPoint
                : getLastAbsPoint(suitableLeftPart)
            : suitableRightPart?.absLeftPoint;
    }

    function computeRightClosestPoint(part: TPart): TPart['absRightPoint'] {
        const getParts = ctx.partsController.getParts.bind(ctx.partsController, part.seriesId);
        const suitableRightPart = Enumerable.from(partTraverseToRightSide(getParts, part))
            .takeWhile((part) => part.unresolved === false)
            .where((part) => part.size > 0 || !isUndefined(part.absRightPoint))
            .firstOrDefault(undefined);

        const suitableLeftPart =
            suitableRightPart === undefined && part.size === 0
                ? Enumerable.from(partTraverseToRightSide(getParts, part))
                      .takeWhile(
                          (p) =>
                              !isNil(p.absRightPoint) || (p.size === 0 && p.unresolved === false),
                      )
                      .where((p) => {
                          return !isNil(p.absRightPoint) && p.absRightPoint.x > part.interval[1];
                      })
                      .firstOrDefault(undefined)
                : undefined;

        return suitableRightPart
            ? suitableRightPart.size === 0
                ? suitableRightPart.absRightPoint
                : getFirstAbsPoint(suitableRightPart)
            : suitableLeftPart?.absRightPoint;
    }

    function loadPoint(part: TPart, side: EPointSide): Observable<TPartClosestAbsPoint> {
        loadableParts.add(part.id);

        return ctx
            .partsLoader!.loadClosestPoints(
                part.seriesId,
                side === EPointSide.Left ? part.interval[0] : part.interval[1],
                part.pixelSize,
                side,
                part.unresolved === 'live',
                part.id,
            )
            .pipe(
                map((data) =>
                    side === EPointSide.Left ? data.absLeftPoint! : data.absRightPoint!,
                ),
                finalize(() => loadableParts.delete(part.id)),
            );
    }
}

function* partTraverseToLeftSide(
    getParts: (start: Someseconds, end: Someseconds, pixelSize: Someseconds) => TPart[],
    part: TPart,
) {
    while (true) {
        const gap = (part.interval[1] - part.interval[0]) * 0.01;
        const parts = getParts(
            minus(part.interval[0], gap),
            minus(part.interval[0], gap),
            part.pixelSize,
        );

        if (parts.length === 0) {
            break;
        }

        if (parts.length > 1) {
            loggerCharter.error('In one place more than one part');
            break;
        }

        part = parts[0];

        yield part;
    }
}

function* partTraverseToRightSide(
    getParts: (start: Someseconds, end: Someseconds, pixelSize: Someseconds) => TPart[],
    part: TPart,
) {
    while (true) {
        const gap = (part.interval[1] - part.interval[0]) * 0.01;
        const parts = getParts(
            plus(part.interval[1], gap),
            plus(part.interval[1], gap),
            part.pixelSize,
        );

        if (parts.length === 0) {
            break;
        }

        if (parts.length > 1) {
            loggerCharter.error('In one place more than one part');
            break;
        }

        part = parts[0];

        yield part;
    }
}
