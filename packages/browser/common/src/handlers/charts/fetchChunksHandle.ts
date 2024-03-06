import { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TSocketURL } from '../../types/domain/sockets';
import { Nanoseconds } from '../../types/time';
import { TPromqlQuery } from '../../utils/Promql';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { ERemoteProcedureType, EServerRemoteProcedureName } from '../../utils/RPC/defs';

export enum EExtraPointMode {
    Auto = 'Auto',
    Disabled = 'Disabled',
}

export type TFetchChunksProps = {
    url: TSocketURL;
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

export type TFetchChunksRequestBody = Omit<TFetchChunksProps, 'url'> & {
    type: 'FetchChunks';
};

export type TFetchChunksResponseBody = {
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

export const descriptor = createRemoteProcedureDescriptor<
    TFetchChunksRequestBody,
    TFetchChunksResponseBody
>()(EServerRemoteProcedureName.FetchChunks, ERemoteProcedureType.Request);

export const ModuleFetchChunks = createRemoteProcedureCall(descriptor)();

export function fetchChunksHandle(
    request: TFetchHandler,
    props: TFetchChunksProps,
    options: THandlerOptions,
): Observable<TReceivedData<TFetchChunksResponseBody>> {
    return request<TFetchChunksRequestBody, TFetchChunksResponseBody>(
        props.url,
        {
            type: 'FetchChunks',
            query: props.query,
            epoch: props.epoch,
            linger: props.linger,
            timestep: props.timestep,
            startTime: props.startTime,
            maxInterval: props.maxInterval,
            maxBatchSize: props.maxBatchSize,
            leftPointMode: props.leftPointMode,
            rightPointMode: props.rightPointMode,
        },
        options,
    );
}
