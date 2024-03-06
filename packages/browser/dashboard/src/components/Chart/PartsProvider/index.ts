import type {
    TPartClosestPoints,
    TPartInterval,
    TPartItemsData,
    TPartPointBuffer,
    TSeriesId,
} from '@frontend/charter/lib/Parts/def';
import type {
    TRequestClosestPoints,
    TRequestPartsItems,
} from '@frontend/charter/src/services/PartsLoader';
import type {
    TGetChartPointsProps,
    TPointStyle,
} from '@frontend/common/src/actors/ChartsDataProvider/actions/defs';
import { getChartPointsEnvBox } from '@frontend/common/src/actors/ChartsDataProvider/envelops';
import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { EExtraPointMode } from '@frontend/common/src/handlers/charts/fetchChunksHandle';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { Minutes } from '@frontend/common/src/types/time';
import { EMPTY_OBJECT } from '@frontend/common/src/utils/const';
import { isRealtimeChunkRequest } from '@frontend/common/src/utils/domain/chunks';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import type { TPromqlQuery } from '@frontend/common/src/utils/Promql';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { semanticHash } from '@frontend/common/src/utils/semanticHash';
import {
    milliseconds2nanoseconds,
    minutes2milliseconds,
    toNanoseconds,
} from '@frontend/common/src/utils/time';
import { generateTraceId, TraceId } from '@frontend/common/src/utils/traceId';
import type { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import type { ActorContext } from 'webactor';

const SHARE_RESET_DELAY = minutes2milliseconds(1 as Minutes);

export class PartItemsProvider {
    constructor(
        private ctx: TContextRef,
        private options: {
            getUrl: (id: TSeriesId) => undefined | TSocketURL;
            getQuery: (id: TSeriesId) => undefined | TPromqlQuery;
            getStyle: (id: TSeriesId) => TPointStyle;
            getStyler: (id: TSeriesId) => undefined | string;
            getFormula: (id: TSeriesId) => undefined | string;
        },
    ) {}

    requestChunk: TRequestPartsItems = (props, options) => {
        const actor = ModuleActor(this.ctx);
        const url = this.getUrl(props.seriesId);
        const query = this.getQuery(props.seriesId);
        const style = this.options.getStyle(props.seriesId);
        const styler = this.options.getStyler(props.seriesId);
        const formula = this.options.getFormula(props.seriesId);

        return requestChunk(
            actor,
            {
                url,
                query,
                style,
                styler,
                formula,

                linger: milliseconds2nanoseconds(props.linger),
                timestep: toNanoseconds(props.timestep),
                startTime: toNanoseconds(props.startTime),
                maxInterval: toNanoseconds(props.maxInterval),
                maxBatchSize: props.maxBatchSize,
                leftPointMode: props.leftPoint ? EExtraPointMode.Auto : EExtraPointMode.Disabled,
                rightPointMode: props.rightPoint ? EExtraPointMode.Auto : EExtraPointMode.Disabled,
            },
            options?.traceId ?? generateTraceId(),
        );
    };

    requestPoints: TRequestClosestPoints = (props, options) => {
        const actor = ModuleActor(this.ctx);
        const url = this.getUrl(props.seriesId);
        const query = this.getQuery(props.seriesId);
        const style = this.options.getStyle(props.seriesId);
        const styler = this.options.getStyler(props.seriesId);
        const formula = this.options.getFormula(props.seriesId);

        return requestPoints(
            actor,
            {
                url,
                query,
                style,
                styler,
                formula,

                linger: milliseconds2nanoseconds(props.linger),
                timestep: toNanoseconds(props.timestep),
                startTime: toNanoseconds(props.startTime),
                maxInterval: toNanoseconds(0),
                maxBatchSize: 0,
                leftPointMode: props.leftPoint ? EExtraPointMode.Auto : EExtraPointMode.Disabled,
                rightPointMode: props.rightPoint ? EExtraPointMode.Auto : EExtraPointMode.Disabled,
            },
            options?.traceId ?? generateTraceId(),
        );
    };

    private getUrl(id: TSeriesId): TSocketURL {
        const url = this.options.getUrl(id);

        if (url === undefined) {
            throw new Error(`No URL for series ${id}`);
        }

        return url;
    }

    private getQuery(id: TSeriesId): TPromqlQuery {
        const query = this.options.getQuery(id);

        if (query === undefined) {
            throw new Error(`No query for series ${id}`);
        }

        return query;
    }
}

const requestChunk = dedobs(
    (
        actor: ActorContext,
        props: Omit<TGetChartPointsProps, 'traceId'>,
        traceId: TraceId,
    ): Observable<TPartItemsData> => {
        return getChartPointsEnvBox.requestStream(actor, { ...props, traceId: traceId }).pipe(
            map(({ items, interval, size, unresolved, baseValue }) => {
                return {
                    size,
                    interval: interval as unknown as TPartInterval,
                    unresolved,
                    buffer: items as TPartPointBuffer,
                    baseValue: baseValue ?? 0,
                    absLeftPoint: undefined,
                    absRightPoint: undefined,
                };
            }),
            isRealtimeChunkRequest(props)
                ? share()
                : shareReplayWithDelayedReset(SHARE_RESET_DELAY, Infinity),
        );
    },
    {
        normalize: ([, props]) => semanticHash.get(props, EMPTY_OBJECT),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);

const requestPoints = dedobs(
    (
        actor: ActorContext,
        props: Omit<TGetChartPointsProps, 'traceId'>,
        traceId: TraceId,
    ): Observable<TPartClosestPoints> => {
        return getChartPointsEnvBox.requestStream(actor, { ...props, traceId }).pipe(
            map(({ absLeftPoint, absRightPoint }) => {
                return <TPartClosestPoints>{
                    absLeftPoint,
                    absRightPoint,
                };
            }),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([, props]) => semanticHash.get(props, EMPTY_OBJECT),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);
