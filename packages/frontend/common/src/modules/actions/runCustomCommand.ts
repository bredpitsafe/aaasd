import { TContextRef } from '../../di';
import { runCustomCommandHandle } from '../../handlers/runCustomCommandHandle';
import { TSocketURL } from '../../types/domain/sockets';
import { TStructurallyCloneable } from '../../types/serialization';
import { ModuleCommunicationHandlers } from '../communicationHandlers';
import { TStreamHandler } from '../communicationHandlers/def';
import { ModuleCommunicationHandlersRemoted } from '../communicationRemoteHandlers';

export type TCustomCommandPayload = {
    type: string;
    [key: string]: TStructurallyCloneable;
};
const runCustomCommandUnbound = (
    handler: TStreamHandler,
    url: TSocketURL,
    payload: TCustomCommandPayload,
) =>
    runCustomCommandHandle(handler, url, payload, {
        retries: 0,
        retryOnReconnect: false,
    });

export const runCustomCommand = (
    ctx: TContextRef,
    url: TSocketURL,
    payload: TCustomCommandPayload,
) => {
    const { requestStream } = ModuleCommunicationHandlers(ctx);
    return runCustomCommandUnbound(requestStream, url, payload);
};
export const runCustomCommandRemote = (
    ctx: TContextRef,
    url: TSocketURL,
    payload: TCustomCommandPayload,
) => {
    const { requestStream } = ModuleCommunicationHandlersRemoted(ctx);
    return runCustomCommandUnbound(requestStream, url, payload);
};
