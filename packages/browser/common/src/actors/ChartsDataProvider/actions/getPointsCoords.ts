import { isFinite, isNil } from 'lodash-es';
import { from, Observable, scan } from 'rxjs';
import { filter, map, share, switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import {
    fetchChunksHandle,
    TFetchChunksResponseBody,
} from '../../../handlers/charts/fetchChunksHandle';
import { EHeaderState, TReceivedData } from '../../../lib/BFFSocket/def';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import type { Nil } from '../../../types';
import type { Nanoseconds } from '../../../types/time';
import { assert } from '../../../utils/assert';
import { EMPTY_OBJECT } from '../../../utils/const';
import { isRealtimeChunkRequest } from '../../../utils/domain/chunks';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { semanticHash } from '../../../utils/semanticHash';
import {
    COORDS_ITEM_SIZE,
    ECoordsPointItemOffset,
    POINTS_SHARE_RESET_DELAY,
    TClosestPoint,
    TGetPointsCoordsProps,
    TGetPointsCoordsReturnType,
    TUnresolvedState,
} from './defs';

export const getPointsCoords = dedobs(
    (ctx: TContextRef, props: TGetPointsCoordsProps): Observable<TGetPointsCoordsReturnType> => {
        const { request } = ModuleCommunicationHandlersRemoted(ctx);

        return fetchChunksHandle(request, { ...props, epoch: 0 }, { traceId: props.traceId }).pipe(
            scan(scanChunkMetadata, {
                canPush: false,

                delta: 0,
                startTime: props.startTime,
                maxInterval: props.maxInterval,

                size: undefined as unknown as number,
                items: undefined as unknown as number[],
                interval: undefined as unknown as [Nanoseconds, Nanoseconds],
                baseValue: undefined as unknown as number,
                unresolved: undefined as unknown as TUnresolvedState,
                absLeftPoint: undefined as Nil | TClosestPoint,
                absRightPoint: undefined as Nil | TClosestPoint,
            }),
            scan(scanDetectFlushPoint, {
                canPush: false,
                chunks: [],
            }),
            filter(({ canPush, chunks }) => canPush && chunks.length > 0),
            switchMap(({ chunks }) => from(chunks)),
            map(
                ({
                    size,
                    items,
                    interval,
                    baseValue,
                    unresolved,
                    absLeftPoint,
                    absRightPoint,
                }: TAccPartItemsMetadata) => {
                    return {
                        size,
                        items,
                        interval,
                        baseValue,
                        unresolved,
                        absLeftPoint,
                        absRightPoint,
                    };
                },
            ),
            isRealtimeChunkRequest(props)
                ? share()
                : shareReplayWithDelayedReset(POINTS_SHARE_RESET_DELAY, Infinity),
        );
    },
    {
        normalize: ([, props]) => semanticHash.get(props, EMPTY_OBJECT),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

function scanDetectFlushPoint(
    acc: TAccPartItemsMetadataAggregated,
    partItemsMetadata: TAccPartItemsMetadata,
): TAccPartItemsMetadataAggregated {
    if (!acc.canPush) {
        acc.chunks.push(partItemsMetadata);
    } else {
        acc.chunks = [partItemsMetadata];
    }

    return {
        canPush: partItemsMetadata.canPush,
        chunks: acc.chunks,
    };
}

type TAccPartItemsMetadata = {
    canPush: boolean;
    startTime: Nanoseconds;
    maxInterval: Nanoseconds;
    delta: number;

    size: number;
    items: number[]; // (x,y)[]
    interval: [Nanoseconds, Nanoseconds];
    baseValue: number;
    // TODO: USE ENUM
    unresolved: false | 'live' | 'failed';
    absLeftPoint: Nil | TClosestPoint;
    absRightPoint: Nil | TClosestPoint;
};

type TAccPartItemsMetadataAggregated = {
    canPush: boolean;
    chunks: TAccPartItemsMetadata[];
};

function scanChunkMetadata(
    acc: TAccPartItemsMetadata,
    envelope: TReceivedData<TFetchChunksResponseBody>,
): TAccPartItemsMetadata {
    const { state, payload } = envelope;
    const { startTime, data, updatable } = payload.chunk;
    const prevDelta = acc.delta;
    const deltaTime =
        data.items.length === 0
            ? 0
            : // time can't be null, only values
              data.items.at(-2);
    assert(!isNil(deltaTime), 'deltaTime is null');
    const intervalStart = startTime + prevDelta;
    const intervalEnd =
        state === EHeaderState.Done ? acc.startTime + acc.maxInterval : startTime + deltaTime;
    const interval = [intervalStart, intervalEnd] as [Nanoseconds, Nanoseconds];
    const baseValue = computeBaseValue(data.items);
    const items = mutateItems(data.items, -prevDelta, -baseValue);
    const size = items.length / COORDS_ITEM_SIZE;

    return {
        delta: deltaTime,
        canPush: acc.canPush || state !== EHeaderState.InProgress || !updatable,
        startTime: acc.startTime,
        maxInterval: acc.maxInterval,

        size,
        items,
        interval,
        baseValue,
        unresolved:
            updatable || state === EHeaderState.Aborted || state === EHeaderState.LimitReached
                ? 'live'
                : false,
        absLeftPoint: computeClosestPoint(payload.leftPoint),
        absRightPoint: computeClosestPoint(payload.rightPoint),
    };
}

function computeBaseValue(items: (null | number)[]): number {
    for (let i = 0; i < items.length; i += COORDS_ITEM_SIZE) {
        const value = items[i + ECoordsPointItemOffset.y];
        if (isFinite(value)) return value as number;
    }

    return 0;
}

function computeClosestPoint(point: TFetchChunksResponseBody['leftPoint']): Nil | TClosestPoint {
    return isNil(point)
        ? point
        : {
              x: point.ts as Nanoseconds,
              y: point.value ?? NaN,
          };
}

function mutateItems(arr: (null | number)[], deltaTime: number, deltaValue: number): number[] {
    for (let i = 0; i < arr.length; i += COORDS_ITEM_SIZE) {
        arr[i + ECoordsPointItemOffset.x] = arr[i + ECoordsPointItemOffset.x]! + deltaTime;
        arr[i + ECoordsPointItemOffset.y] =
            arr[i + ECoordsPointItemOffset.y] === null
                ? NaN
                : arr[i + ECoordsPointItemOffset.y]! + deltaValue;
    }

    return arr as number[];
}
