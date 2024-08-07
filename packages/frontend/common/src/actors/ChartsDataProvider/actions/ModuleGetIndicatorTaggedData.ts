import type { Hours, Milliseconds, Minutes, Nanoseconds, Seconds } from '@common/types';
import {
    hours2milliseconds,
    minutes2milliseconds,
    NanoDate,
    seconds2milliseconds,
} from '@common/utils';
import type { Observable } from 'rxjs';

import { DEFAULT_SERVER_TIME_INCREMENT } from '../../../defs/domain/chunks';
import type {
    ETimeseriesAggregationFunction,
    TTimeseriesFilter,
} from '../../../modules/actions/def.ts';
import { ETimeseriesAggregationIntervalUnit } from '../../../modules/actions/def.ts';
import type { TSocketName, TSocketURL } from '../../../types/domain/sockets';
import { EGrpcErrorCode, GrpcError } from '../../../types/GrpcError';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import { throwingError } from '../../../utils/throwingError';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';
import { ModuleTaggedTimeseriesDataHistoryBank } from '../storage/ModuleTaggedTimeseriesDataHistoryBank';
import type { TTaggedTimeseriesData } from './ModuleFetchTaggedTimeseriesData';

export type TGetIndicatorTaggedData = {
    target: TSocketURL;
    stage: TSocketName;

    timeInc: Nanoseconds;
    leftTimeBoundInc: Nanoseconds;
    // MUST BE LOWER THAN "LOCAL" NOW
    rightTimeBoundInc: Nanoseconds;

    filter?: TTimeseriesFilter;
    aggregation: {
        function:
            | ETimeseriesAggregationFunction.Last
            | ETimeseriesAggregationFunction.FlattenCandle;
        interval: Milliseconds; // 0 for raw data
    };
};

const FINITE_INFINITY_COUNT = 1e10;

export const ModuleGetIndicatorTaggedData = createObservableProcedure((ctx) => {
    const bank = ModuleTaggedTimeseriesDataHistoryBank(ctx);

    return (
        params: TGetIndicatorTaggedData,
        { traceId },
    ): Observable<
        TValueDescriptor2<
            TTaggedTimeseriesData[
                | ETimeseriesAggregationFunction.Unspecified
                | ETimeseriesAggregationFunction.Last
                | ETimeseriesAggregationFunction.FlattenCandle]
        >
    > => {
        const intervalUnit = transferIntervalToUnit(params.aggregation.interval);
        const aggregation = {
            function: params.aggregation.function,
            intervalUnit: intervalUnit,
            intervalValue: transferIntervalToValue(params.aggregation.interval, intervalUnit),
        };

        // TODO: Check case when nanoseconds more than 1 second
        const rightDate = new NanoDate(DEFAULT_SERVER_TIME_INCREMENT);
        rightDate.setNanoseconds(params.rightTimeBoundInc);
        const leftDate = new NanoDate(DEFAULT_SERVER_TIME_INCREMENT);
        leftDate.setNanoseconds(params.leftTimeBoundInc);
        const needleDate = new NanoDate(DEFAULT_SERVER_TIME_INCREMENT);
        needleDate.setNanoseconds(params.timeInc);
        const needleISO = needleDate.toISOString();

        const store = bank.borrow({
            target: params.target,
            requestStage: params.stage,
            filter: params.filter,
            aggregation: aggregation,
        });

        return store.value
            .getItems(
                traceId,
                FINITE_INFINITY_COUNT,
                rightDate.toISOString(),
                leftDate.toISOString(),
            )
            .pipe(
                mapValueDescriptor(({ value: items }) => {
                    const taggedData = items.find((item) => item.timestamp === needleISO);

                    if (taggedData) return createSyncedValueDescriptor(taggedData.data);
                    else
                        throwingError(
                            new GrpcError('Tagged data not found', {
                                code: EGrpcErrorCode.NOT_FOUND,
                                traceId,
                            }),
                        );
                }),
            );
    };
});

function transferIntervalToUnit(interval: Milliseconds): ETimeseriesAggregationIntervalUnit {
    switch (true) {
        case interval >= hours2milliseconds(1 as Hours):
            return ETimeseriesAggregationIntervalUnit.Hour;
        case interval >= minutes2milliseconds(1 as Minutes):
            return ETimeseriesAggregationIntervalUnit.Min;
        case interval >= seconds2milliseconds(1 as Seconds):
            return ETimeseriesAggregationIntervalUnit.Sec;
        case interval > 0:
            return ETimeseriesAggregationIntervalUnit.Millis;
        default:
            return ETimeseriesAggregationIntervalUnit.Unspecified;
    }
}

function transferIntervalToValue(
    interval: Milliseconds,
    unit: ETimeseriesAggregationIntervalUnit,
): number {
    switch (unit) {
        case ETimeseriesAggregationIntervalUnit.Hour:
            return interval / hours2milliseconds(1 as Hours);
        case ETimeseriesAggregationIntervalUnit.Min:
            return interval / minutes2milliseconds(1 as Minutes);
        case ETimeseriesAggregationIntervalUnit.Sec:
            return interval / seconds2milliseconds(1 as Seconds);
        case ETimeseriesAggregationIntervalUnit.Millis:
            return interval;
        default:
            return 0;
    }
}
