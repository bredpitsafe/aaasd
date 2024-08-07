import type { Minutes } from '@common/types';
import {
    generateTraceId,
    milliseconds2nanoseconds,
    minutes2milliseconds,
    toNanoseconds,
} from '@common/utils';
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
import { EExtraPointMode } from '@frontend/common/src/actors/ChartsDataProvider/actions/ModuleGetIndicatorPoints.ts';
import { getChartPointsProcedureDescriptor } from '@frontend/common/src/actors/ChartsDataProvider/descriptors';
import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { DEDOBS_SKIP_KEY } from '@frontend/common/src/utils/observable/memo.ts';
import type { TPromqlQuery } from '@frontend/common/src/utils/Promql';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify.ts';
import {
    extractValueDescriptor,
    mapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TPointStyle } from '@frontend/common/src/utils/Sandboxes/pointStyler';
import { semanticHash } from '@frontend/common/src/utils/semanticHash';

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
        const notifyErrorAndFail = ModuleNotifyErrorAndFail(this.ctx);
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
        ).pipe(notifyErrorAndFail(), extractValueDescriptor());
    };

    requestPoints: TRequestClosestPoints = (props, options) => {
        const requestPoints = ModuleRequestPoints(this.ctx);
        const notifyErrorAndFail = ModuleNotifyErrorAndFail(this.ctx);
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
        ).pipe(notifyErrorAndFail(), extractValueDescriptor());
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
    getPipe: () => {
        return mapValueDescriptor(({ value }) => {
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
        });
    },
    dedobs: {
        normalize: ([props]) =>
            props.live
                ? DEDOBS_SKIP_KEY
                : semanticHash.get(props, {
                      style: {},
                  }),
        resetDelay: SHARE_RESET_DELAY,
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
                ? DEDOBS_SKIP_KEY
                : semanticHash.get(props, {
                      style: {},
                  }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
