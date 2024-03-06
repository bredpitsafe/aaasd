import { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { Nanoseconds } from '../../types/time';
import {
    TFetchChunksProps,
    TFetchChunksRequestBody,
    TFetchChunksResponseBody,
} from './fetchChunksHandle';

export type TFetchPointsProps = Omit<TFetchChunksProps, 'maxInterval' | 'maxBatchSize'>;
export type TFetchPointsRequestBody = TFetchChunksRequestBody;
export type TFetchPointsResponseBody = Omit<TFetchChunksResponseBody, 'chunk'>;

export function fetchPointsHandle(
    request: TFetchHandler,
    props: TFetchPointsProps,
    options: THandlerOptions,
): Observable<TReceivedData<TFetchPointsResponseBody>> {
    return request<TFetchPointsRequestBody, TFetchPointsResponseBody>(
        props.url,
        {
            type: 'FetchChunks',
            query: props.query,
            epoch: props.epoch,
            linger: props.linger,
            timestep: props.timestep,
            startTime: props.startTime,
            maxInterval: 0 as Nanoseconds,
            maxBatchSize: 0,
            leftPointMode: props.leftPointMode,
            rightPointMode: props.rightPointMode,
        },
        options,
    );
}
