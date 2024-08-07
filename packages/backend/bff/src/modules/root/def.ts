import type { TRpcApi } from '../../def/rpc.ts';
import type {
    THeartbeatRequestPayload,
    THeartbeatResponsePayload,
} from './schemas/Heartbeat.schema.ts';
import type { TPingRequestPayload, TPingResponsePayload } from './schemas/Ping.schema.ts';
import type {
    TServerHeartbeatRequestPayload,
    TServerHeartbeatResponsePayload,
} from './schemas/ServerHeartbeat.ts';
import type {
    TUnsubscribeRequestPayload,
    TUnsubscribeResponsePayload,
} from './schemas/Unsubscribe.schema.ts';

export enum EGeneralRouteName {
    Unsubscribe = 'Unsubscribe',
    Ping = 'Ping',
    Heartbeat = 'Heartbeat',
    ServerHeartbeat = 'ServerHeartbeat',
}

export type TGeneralRoutesMap = {
    [EGeneralRouteName.Unsubscribe]: TRpcApi<
        TUnsubscribeRequestPayload,
        TUnsubscribeResponsePayload
    >;
    [EGeneralRouteName.Ping]: TRpcApi<TPingRequestPayload, TPingResponsePayload>;
    [EGeneralRouteName.Heartbeat]: TRpcApi<THeartbeatRequestPayload, THeartbeatResponsePayload>;
    [EGeneralRouteName.ServerHeartbeat]: TRpcApi<
        TServerHeartbeatRequestPayload,
        TServerHeartbeatResponsePayload
    >;
};
