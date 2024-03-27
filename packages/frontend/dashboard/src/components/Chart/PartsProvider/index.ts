import type {
    TPartClosestPoints,
    TPartInterval,
    TPartPointBuffer,
    TSeriesId,
} from '@frontend/charter/lib/Parts/def';
import type {
    TRequestClosestPoints,
    TRequestPartsItems,
} from '@frontend/charter/src/services/PartsLoader';
import { getChartPointsProcedureDescriptor } from '@frontend/common/src/actors/ChartsDataProvider/descriptors';
import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { EExtraPointMode } from '@frontend/common/src/handlers/charts/fetchChunksHandle';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { Minutes } from '@frontend/common/src/types/time';
import type { TPromqlQuery } from '@frontend/common/src/utils/Promql';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import {
    extractSyncedValueFromValueDescriptor,
    mapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TPointStyle } from '@frontend/common/src/utils/Sandboxes/pointStyler';
import { semanticHash } from '@frontend/common/src/utils/semanticHash';
import {
    milliseconds2nanoseconds,
    minutes2milliseconds,
    toNanoseconds,
} from '@frontend/common/src/utils/time';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { uniqueHash } from '@frontend/common/src/utils/uniqueHash';
import { identity, pipe } from 'rxjs';

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
        const requestChunk = ModuleRequestChunk(this.ctx);
        const target = this.getUrl(props.seriesId);
        const query = this.getQuery(props.seriesId);
        const style = this.options.getStyle(props.seriesId);
        const styler = this.options.getStyler(props.seriesId);
        const formula = this.options.getFormula(props.seriesId);

        return requestChunk(
            {
                target,
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

                live: props.live,
            },
            { traceId: options?.traceId ?? generateTraceId() },
        ).pipe(extractSyncedValueFromValueDescriptor());
    };

    requestPoints: TRequestClosestPoints = (props, options) => {
        const requestPoints = ModuleRequestPoints(this.ctx);
        const target = this.getUrl(props.seriesId);
        const query = this.getQuery(props.seriesId);
        const style = this.options.getStyle(props.seriesId);
        const styler = this.options.getStyler(props.seriesId);
        const formula = this.options.getFormula(props.seriesId);

        return requestPoints(
            {
                target,
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

                live: props.live,
            },
            { traceId: options?.traceId ?? generateTraceId() },
        ).pipe(extractSyncedValueFromValueDescriptor());
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

const ModuleRequestChunk = createRemoteProcedureCall(getChartPointsProcedureDescriptor)({
    getPipe: (params) => {
        return pipe(
            mapValueDescriptor(({ value }) => {
                const { items, interval, size, unresolved, baseValue } = value;
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
            params.live ? identity : shareReplayWithDelayedReset(SHARE_RESET_DELAY, Infinity),
        );
    },
    dedobs: {
        normalize: ([props]) =>
            props.live
                ? uniqueHash.get()
                : semanticHash.get(props, {
                      style: {},
                  }),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

const ModuleRequestPoints = createRemoteProcedureCall(getChartPointsProcedureDescriptor)({
    getPipe: () =>
        mapValueDescriptor(({ value }) => {
            return <TPartClosestPoints>{
                absLeftPoint: value.absLeftPoint,
                absRightPoint: value.absRightPoint,
            };
        }),
    dedobs: {
        normalize: ([props]) =>
            props.live
                ? uniqueHash.get()
                : semanticHash.get(props, {
                      style: {},
                  }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
