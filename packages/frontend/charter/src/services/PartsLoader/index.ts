import type { Milliseconds, Seconds, Someseconds } from '@common/types';
import type { TraceId } from '@common/utils';
import { seconds2milliseconds, sum, toMilliseconds } from '@common/utils';
import type { THandlerOptions } from '@frontend/common/src/modules/communicationHandlers/def';
import type { Observable } from 'rxjs';

import type {
    TPartClosestPoints,
    TPartInterval,
    TPartItemsData,
    TSeriesId,
} from '../../../lib/Parts/def';
import { assetCorrectInterval } from './utils';

const LINGER_INTERVAL = seconds2milliseconds(10 as Seconds);
const LINGER_TIMEOUT = sum(LINGER_INTERVAL, seconds2milliseconds(5 as Seconds));

export type TRequestPartsProps = {
    seriesId: TSeriesId;
    linger: Milliseconds;
    timestep: Someseconds;
    startTime: Someseconds;
    maxInterval: Someseconds;
    maxBatchSize: number;
    leftPoint: boolean;
    rightPoint: boolean;
    live: boolean;
};
export type TRequestClosestPointsProps = Omit<TRequestPartsProps, 'maxInterval' | 'maxBatchSize'>;

export type TRequestPartsItems = (
    props: TRequestPartsProps,
    options?: THandlerOptions,
) => Observable<TPartItemsData>;
export type TRequestClosestPoints = (
    props: TRequestClosestPointsProps,
    options?: THandlerOptions,
) => Observable<TPartClosestPoints>;

type PartsLoaderProps = {
    requestPartsItems: TRequestPartsItems;
    requestClosestPoints: TRequestClosestPoints;
};

export enum EPointSide {
    Left = 'Left',
    Right = 'Right',
}

export class PartsLoader {
    constructor(private options: PartsLoaderProps) {}

    loadItemsData(
        seriesId: TSeriesId,
        interval: TPartInterval,
        pixelSize: Someseconds,
        maxItemsSize: number,
        live: boolean,
        traceId: TraceId,
    ): Observable<TPartItemsData> {
        assetCorrectInterval(interval, pixelSize);

        return this.options.requestPartsItems(
            {
                seriesId,
                linger: live ? LINGER_INTERVAL : toMilliseconds(0),

                timestep: pixelSize,
                startTime: interval[0],
                maxInterval: sum(interval[1], -interval[0]),
                maxBatchSize: maxItemsSize,

                leftPoint: false,
                rightPoint: false,

                live,
            },
            {
                traceId,
                ...(live ? { timeout: LINGER_TIMEOUT } : undefined),
            },
        );
    }

    loadClosestPoints(
        seriesId: TSeriesId,
        timestamp: Someseconds,
        pixelSize: Someseconds,
        pointSide: EPointSide,
        live: boolean,
        traceId: TraceId,
    ): Observable<TPartClosestPoints> {
        return this.options.requestClosestPoints(
            {
                seriesId,
                linger: 0 as Milliseconds,
                timestep: pixelSize,
                startTime: timestamp,
                leftPoint: pointSide === EPointSide.Left,
                rightPoint: pointSide === EPointSide.Right,
                live,
            },
            {
                traceId,
            },
        );
    }
}
