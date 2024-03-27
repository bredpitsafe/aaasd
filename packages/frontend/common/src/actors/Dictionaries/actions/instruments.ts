import { map, Observable, startWith } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables';
import { TContextRef } from '../../../di';
import {
    EDictionaryType,
    getDictionaryHandle,
    TInstrumentsDictionaryParams,
} from '../../../handlers/getDictionariesHandle';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { TInstrument } from '../../../types/domain/instrument';
import { TSocketURL } from '../../../types/domain/sockets';
import { getExchangeLinkByName } from '../../../utils/exchangeLinks/getExchangeLinkByName';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { semanticHash } from '../../../utils/semanticHash';
import { TraceId } from '../../../utils/traceId';

export type TInstrumentsDictionaryProps = {
    url: TSocketURL;
    traceId: TraceId;
} & TInstrumentsDictionaryParams;

export type TGetInstrumentsDictionaryReturnType = TInstrument[] | undefined;
export const getInstrumentsDictionary$ = dedobs(
    (
        ctx: TContextRef,
        props: TInstrumentsDictionaryProps,
    ): Observable<TGetInstrumentsDictionaryReturnType> => {
        const { request } = ModuleCommunicationHandlersRemoted(ctx);

        return getDictionaryHandle(
            request,
            props.url,
            EDictionaryType.instruments,
            {
                traceId: props.traceId,
            },
            { filters: props.filters },
        ).pipe(
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
        normalize: ([, props]) =>
            semanticHash.get(props, {
                filters: {
                    statuses: semanticHash.withSorter(null),
                    nameRegexes: semanticHash.withSorter(null),
                },
            }),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);
