import { map, Observable, startWith } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import { EDictionaryType, getDictionaryHandle } from '../../../handlers/getDictionariesHandle';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TAsset } from '../../../types/domain/asset';
import { TSocketURL } from '../../../types/domain/sockets';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { shallowHash } from '../../../utils/shallowHash';
import { TraceId } from '../../../utils/traceId';

export type TAssetsDictionaryProps = {
    url: TSocketURL;
    traceId: TraceId;
};

export type TGetAssetsDictionaryReturnType = TAsset[] | undefined;

export const getAssetsDictionary$ = dedobs(
    (
        ctx: TContextRef,
        props: TAssetsDictionaryProps,
    ): Observable<TGetAssetsDictionaryReturnType> => {
        const { request } = ModuleCommunicationHandlersRemoted(ctx);

        return getDictionaryHandle(request, props.url, EDictionaryType.assets, {
            traceId: props.traceId,
        }).pipe(
            map((envelope) => envelope.payload.assets),
            startWith(undefined),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([c, props]) => shallowHash(c, props.url),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);
