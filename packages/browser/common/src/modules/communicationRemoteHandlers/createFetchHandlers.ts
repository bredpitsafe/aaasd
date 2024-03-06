import { ActorContext } from 'webactor';

import { useRemoteHandlerEnvBox } from '../../actors/Handlers/actions';
import { TContextRef } from '../../di';
import { ModuleActor } from '../actor';
import { EActionTypeHandler } from '../communicationHandlers/createFetchHandlers';
import type { TFetchHandler, TStreamHandler } from '../communicationHandlers/def';

export function createFetchHandlersRemoted(ctx: TContextRef) {
    const actor = ModuleActor(ctx);

    const _update = createHandlerRemoted(actor, EActionTypeHandler.update);
    const _request = createHandlerRemoted(actor, EActionTypeHandler.request);
    const update: TFetchHandler = (url, body, options) => _update(url, () => [body], options);
    const request: TFetchHandler = (url, body, options) => _request(url, () => [body], options);
    const requestStream = createHandlerRemoted(actor, EActionTypeHandler.requestStream);

    return {
        update,
        request,
        requestStream,
    };
}

function createHandlerRemoted(actor: ActorContext, type: EActionTypeHandler): TStreamHandler {
    return <TStreamHandler>((target, sender, options) => {
        const bodies = sender();
        return useRemoteHandlerEnvBox.requestStream(actor, {
            target,
            type,
            bodies,
            options,
        });
    });
}
