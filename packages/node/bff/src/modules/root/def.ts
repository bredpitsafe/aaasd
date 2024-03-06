import { TRpcApi } from '../../def/rpc.ts';
import { THeartbeatRequestPayload, THeartbeatResponsePayload } from './schemas/Heartbeat.schema.ts';
import { TPingRequestPayload, TPingResponsePayload } from './schemas/Ping.schema.ts';
import {
    TServerHeartbeatRequestPayload,
    TServerHeartbeatResponsePayload,
} from './schemas/ServerHeartbeat.ts';
import {
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
