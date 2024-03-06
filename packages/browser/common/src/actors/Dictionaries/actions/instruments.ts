import { map, Observable, startWith } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import { EDictionaryType, getDictionaryHandle } from '../../../handlers/getDictionariesHandle';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TInstrument } from '../../../types/domain/instrument';
import { TSocketURL } from '../../../types/domain/sockets';
import { getExchangeLinkByName } from '../../../utils/exchangeLinks/getExchangeLinkByName';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { shallowHash } from '../../../utils/shallowHash';
import { TraceId } from '../../../utils/traceId';

export type TInstrumentsDictionaryProps = {
    url: TSocketURL;
    traceId: TraceId;
};

export type TGetInstrumentsDictionaryReturnType = TInstrument[] | undefined;
export const getInstrumentsDictionary$ = dedobs(
    (
        ctx: TContextRef,
        props: TInstrumentsDictionaryProps,
    ): Observable<TGetInstrumentsDictionaryReturnType> => {
        const { request } = ModuleCommunicationHandlersRemoted(ctx);
        return getDictionaryHandle(request, props.url, EDictionaryType.instruments, {
            traceId: props.traceId,
        }).pipe(
            map((envelope) => envelope.payload.instruments),
            map((instruments) =>
                instruments.map((instrument) => ({
                    ...instrument,
                    href: getExchangeLinkByName(instrument)?.href ?? null,
                })),
            ),
            startWith(undefined),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([c, props]) => shallowHash(c, props.url),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);
