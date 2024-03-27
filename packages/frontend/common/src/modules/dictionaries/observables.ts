import { TInstrumentsDictionaryProps } from '../../actors/Dictionaries/actions/instruments';
import { getAssetsEnvBox, getInstrumentsEnvBox } from '../../actors/Dictionaries/envelopes';
import { TContextRef } from '../../di';
import type { TSocketURL } from '../../types/domain/sockets';
import { progressiveRetry } from '../../utils/Rx/progressiveRetry';
import { TraceId } from '../../utils/traceId';
import { ModuleActor } from '../actor';

export function getAssets$(ctx: TContextRef, url: TSocketURL, traceId: TraceId) {
    const actor = ModuleActor(ctx);

    return getAssetsEnvBox.request(actor, { url, traceId }).pipe(progressiveRetry());
}

export function getInstruments$(
    ctx: TContextRef,
    url: TSocketURL,
    traceId: TraceId,
    filters?: TInstrumentsDictionaryProps['filters'],
) {
    const actor = ModuleActor(ctx);

    return getInstrumentsEnvBox
        .request(actor, {
            url,
            traceId,
            filters,
        })
        .pipe(progressiveRetry());
}
