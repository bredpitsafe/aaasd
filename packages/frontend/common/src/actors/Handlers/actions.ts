import { TPublishLog } from '../../handlers/sendLogsEventHandle';
import { TMetric } from '../../handlers/sendMetricsHandle';
import { TReceivedData } from '../../lib/BFFSocket/def';
import { EActionTypeHandler } from '../../modules/communicationHandlers/createFetchHandlers';
import { THandlerOptions } from '../../modules/communicationHandlers/def';
import { TDataSourceStateMap } from '../../modules/dataSourceStatus/defs';
import { TSocketServerTimeMap } from '../../modules/socketServerTime/defs';
import { TSocketStruct, TSocketURL } from '../../types/domain/sockets';
import { createActorEnvelopeBox } from '../../utils/Actors';
import { createActorObservableBox } from '../../utils/Actors/observable';
import { createActorRequestBox } from '../../utils/Actors/request';

export const sendMetricsEnvBox = createActorEnvelopeBox<TMetric[]>()('SEND_METRICS');

export const sendLogEnvBox = createActorEnvelopeBox<TPublishLog>()('SEND_LOG');

export const useRemoteHandlerEnvBox = createActorRequestBox<
    {
        target: TSocketURL | TSocketStruct;
        type: EActionTypeHandler;
        bodies: [any] | [any, any];
        options: undefined | THandlerOptions;
    },
    TReceivedData<any>
>()('REMOTE_HANDLER');

export const useRemoteStreamHandlerEnvBox = createActorObservableBox<
    {
        target: TSocketURL | TSocketStruct;
        type: EActionTypeHandler;
        bodies: [any] | [any, any];
        options: undefined | THandlerOptions;
    },
    TReceivedData<any>
>()('REMOTE_STREAM_HANDLER');

export const publishDataSourceStateEnvBox = createActorEnvelopeBox<TDataSourceStateMap>()(
    'PUBLISH_DATA_SOURCE_STATUS',
);

export const publishSocketServerTimeEnvBox = createActorEnvelopeBox<TSocketServerTimeMap>()(
    'PUBLISH_SOCKET_SERVER_TIME',
);
