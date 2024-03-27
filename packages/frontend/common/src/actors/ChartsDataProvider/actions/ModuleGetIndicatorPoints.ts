import { isFinite, isNil, omit } from 'lodash-es';
import { from, identity, pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY } from '../../../defs/observables';
import { EHeaderState, TReceivedData } from '../../../lib/BFFSocket/def';
import type { Nil } from '../../../types';
import type { TSocketURL } from '../../../types/domain/sockets';
import type { Nanoseconds } from '../../../types/time';
import { assert } from '../../../utils/assert';
import type { TPromqlQuery } from '../../../utils/Promql';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../../utils/RPC/defs';
import { toSwitch } from '../../../utils/Rx/dynamicMap';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import {
    dynamicMapValueDescriptor,
    scanValueDescriptor,
} from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash';
import { uniqueHash } from '../../../utils/uniqueHash';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '../../../utils/ValueDescriptor/utils';
import {
    COORDS_ITEM_SIZE,
    ECoordsPointItemOffset,
    POINTS_SHARE_RESET_DELAY,
    TClosestPoint,
    TUnresolvedState,
} from './defs';

export enum EExtraPointMode {
    Auto = 'Auto',
    Disabled = 'Disabled',
}

type TFetchChunksRequestBody = {
    query: TPromqlQuery;

    // @deprecated
    epoch: number;
    linger: Nanoseconds; // usually, you want to use 0 for historical data

    timestep: Nanoseconds;
    startTime: Nanoseconds;
    maxInterval: Nanoseconds; // we will restrict the total number of parts

    maxBatchSize: number;

    leftPointMode: EExtraPointMode;
    rightPointMode: EExtraPointMode;
};

type TFetchChunksResponseBody = {
    chunk: {
        startTime: Nanoseconds;
        updatable: boolean;
        data: {
            items: (null | number)[];
        };
    };
    leftPoint: null | { ts: Nanoseconds; value: null | number };
    rightPoint: null | { ts: Nanoseconds; value: null | number };
};

export type TGetIndicatorPointsProps = { target: TSocketURL; live: boolean } & Omit<
    TFetchChunksRequestBody,
    'epoch'
>;

export type TGetPointsCoordsReturnType = {
    size: number;
    items: number[];
    interval: [Nanoseconds, Nanoseconds];
    baseValue: number;
    unresolved: false | 'live' | 'failed';
    absLeftPoint: Nil | TClosestPoint;
    absRightPoint: Nil | TClosestPoint;
};

export const descriptor = createRemoteProcedureDescriptor<
    TFetchChunksRequestBody,
    TFetchChunksResponseBody
>()(EPlatformSocketRemoteProcedureName.FetchChunks, ERemoteProcedureType.Request);

export const ModuleGetIndicatorPoints = createRemoteProcedureCall(descriptor)({
    getParams: (params: TGetIndicatorPointsProps) => {
        return { ...omit(params, 'live'), epoch: 0 };
    },
    getPipe: (params) => {
        return pipe(
            scanValueDescriptor(scanChunkMetadata(params)),
            scanValueDescriptor(scanDetectFlushPoint),
            filter((vd) => {
                return isSyncedValueDescriptor(vd)
                    ? vd.value.canPush && vd.value.chunks.length > 0
                    : false;
            }),
            dynamicMapValueDescriptor(({ value }) => toSwitch(from(value.chunks))),
            map(
                ({
                    size,
                    items,
                    interval,
                    baseValue,
                    unresolved,
                    absLeftPoint,
                    absRightPoint,
                }: TGetPointsCoordsReturnType) => {
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
            params.live
                ? identity
                : shareReplayWithDelayedReset(POINTS_SHARE_RESET_DELAY, Infinity),
        );
    },
    dedobs: {
        normalize: ([params]) => (params.live ? uniqueHash.get() : semanticHash.get(params, {})),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

function scanDetectFlushPoint(
    _acc: undefined | TValueDescriptor2<TAccPartItemsMetadataAggregated>,
    { value: partItemsMetadata }: TValueDescriptor2<TAccPartItemsMetadata>,
) {
    const acc = _acc?.value ?? {
        canPush: false,
        chunks: [],
    };

    if (isNil(partItemsMetadata)) {
        return createSyncedValueDescriptor(acc);
    }

    if (!acc.canPush) {
        acc.chunks.push(partItemsMetadata);
    } else {
        acc.chunks = [partItemsMetadata];
    }

    return createSyncedValueDescriptor({
        canPush: partItemsMetadata.canPush,
        chunks: acc.chunks,
    });
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

const scanChunkMetadata =
    (params: TGetIndicatorPointsProps) =>
    (
        _acc: undefined | TValueDescriptor2<TAccPartItemsMetadata>,
        { value: envelope }: TValueDescriptor2<TReceivedData<TFetchChunksResponseBody>>,
    ): TValueDescriptor2<TAccPartItemsMetadata> => {
        const acc = _acc?.value ?? {
            canPush: false,

            delta: 0,
            startTime: params.startTime,
            maxInterval: params.maxInterval,

            size: undefined as unknown as number,
            items: undefined as unknown as number[],
            interval: undefined as unknown as [Nanoseconds, Nanoseconds],
            baseValue: undefined as unknown as number,
            unresolved: undefined as unknown as TUnresolvedState,
            absLeftPoint: undefined as Nil | TClosestPoint,
            absRightPoint: undefined as Nil | TClosestPoint,
        };

        if (isNil(envelope)) {
            return createSyncedValueDescriptor(acc);
        }

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

        return createSyncedValueDescriptor({
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
        });
    };

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
