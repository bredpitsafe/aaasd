import {
    ETimeseriesAggregationFunction,
    TServerFetchHistoryParams,
    TTimeseriesAggregation,
    TTimeseriesFilter,
} from '../../../handlers/def';
import { TStructurallyCloneableObject } from '../../../types/serialization';
import { ISO } from '../../../types/time';
import { stringJSONToObject, TStringJSON } from '../../../utils/json';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { EBffSocketRemoteProcedureName, ERemoteProcedureType } from '../../../utils/RPC/defs';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';

type TFetchTaggedTimeseriesDataRequest<
    F extends ETimeseriesAggregationFunction = ETimeseriesAggregationFunction,
> = {
    params: TServerFetchHistoryParams;
    filter?: TTimeseriesFilter;
    aggregation: TTimeseriesAggregation<F>;
};

type TStringCandle = {
    open: TStringJSON<TStructurallyCloneableObject>;
    close: TStringJSON<TStructurallyCloneableObject>;
    min: TStringJSON<TStructurallyCloneableObject>;
    max: TStringJSON<TStructurallyCloneableObject>;
};

type TObjectCandle = {
    open: TStructurallyCloneableObject;
    close: TStructurallyCloneableObject;
    min: TStructurallyCloneableObject;
    max: TStructurallyCloneableObject;
};

export type TInternalTaggedTimeseriesEntity<F extends ETimeseriesAggregationFunction> = {
    name: string;
    data: TInternalTaggedTimeseriesData[F];
    value: number;
    timestamp: ISO;
};

export type TInternalTaggedTimeseriesData = {
    [ETimeseriesAggregationFunction.Unspecified]: TStringJSON<TStructurallyCloneableObject>;
    [ETimeseriesAggregationFunction.Last]: TStringJSON<TStructurallyCloneableObject>;
    [ETimeseriesAggregationFunction.FlattenCandle]: TStringJSON<TStructurallyCloneableObject>;
    [ETimeseriesAggregationFunction.Candle]: TStringCandle;
};

export type TTaggedTimeseriesEntity<F extends ETimeseriesAggregationFunction> = {
    name: string;
    data: TTaggedTimeseriesData[F];
    timestamp: ISO;
};

export type TTaggedTimeseriesData = {
    [ETimeseriesAggregationFunction.Unspecified]: TStructurallyCloneableObject;
    [ETimeseriesAggregationFunction.Last]: TStructurallyCloneableObject;
    [ETimeseriesAggregationFunction.FlattenCandle]: TStructurallyCloneableObject;
    [ETimeseriesAggregationFunction.Candle]: TObjectCandle;
};

type TFetchTaggedTimeseriesDataResponse<
    F extends ETimeseriesAggregationFunction = ETimeseriesAggregationFunction,
> = {
    entities: TInternalTaggedTimeseriesEntity<F>[];
};

const descriptor = createRemoteProcedureDescriptor<
    TFetchTaggedTimeseriesDataRequest<
        | ETimeseriesAggregationFunction.Unspecified
        | ETimeseriesAggregationFunction.Last
        | ETimeseriesAggregationFunction.FlattenCandle
    >,
    TFetchTaggedTimeseriesDataResponse<
        | ETimeseriesAggregationFunction.Unspecified
        | ETimeseriesAggregationFunction.Last
        | ETimeseriesAggregationFunction.FlattenCandle
    >
>()(EBffSocketRemoteProcedureName.FetchTaggedTimeseriesData, ERemoteProcedureType.Request);

export const ModuleFetchTaggedTimeseriesData = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        mapValueDescriptor(
            ({
                value,
            }): TTaggedTimeseriesEntity<
                | ETimeseriesAggregationFunction.Unspecified
                | ETimeseriesAggregationFunction.Last
                | ETimeseriesAggregationFunction.FlattenCandle
            >[] => {
                return value.payload.entities.map((entity) => {
                    return {
                        name: entity.name,
                        data: parseTaggedData(entity.data),
                        timestamp: entity.timestamp,
                    };
                });
            },
        ),
});

const candleDescriptor = createRemoteProcedureDescriptor<
    TFetchTaggedTimeseriesDataRequest<ETimeseriesAggregationFunction.Candle>,
    TFetchTaggedTimeseriesDataResponse<ETimeseriesAggregationFunction.Candle>
>()(EBffSocketRemoteProcedureName.FetchTaggedTimeseriesData, ERemoteProcedureType.Request);

export const ModuleFetchCandleTaggedTimeseriesData = createRemoteProcedureCall(candleDescriptor)({
    getPipe: () =>
        mapValueDescriptor(
            ({ value }): TTaggedTimeseriesEntity<ETimeseriesAggregationFunction.Candle>[] => {
                return value.payload.entities.map((entity) => {
                    return {
                        name: entity.name,
                        data: parseCandleTaggedData(entity.data),
                        timestamp: entity.timestamp,
                    };
                });
            },
        ),
});

function parseTaggedData(
    data: TStringJSON<TStructurallyCloneableObject>,
): TStructurallyCloneableObject {
    return stringJSONToObject(data);
}
function parseCandleTaggedData(data: TStringCandle): TObjectCandle {
    return {
        open: stringJSONToObject(data.open),
        close: stringJSONToObject(data.close),
        min: stringJSONToObject(data.min),
        max: stringJSONToObject(data.max),
    };
}
