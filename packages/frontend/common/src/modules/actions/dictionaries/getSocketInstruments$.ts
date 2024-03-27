import { isNil } from 'lodash-es';
import { concat, EMPTY, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { TInstrumentsDictionaryProps } from '../../../actors/Dictionaries/actions/instruments';
import { TContextRef } from '../../../di';
import { TInstrument } from '../../../types/domain/instrument';
import { Minutes } from '../../../types/time';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { semanticHash } from '../../../utils/semanticHash';
import { minutes2milliseconds } from '../../../utils/time';
import { generateTraceId } from '../../../utils/traceId';
import { ModuleDictionaries } from '../../dictionaries';
import { ModuleSocketPage } from '../../socketPage';

export const getSocketInstrumentsDedobsed$ = dedobs(
    (
        ctx: TContextRef,
        filters?: TInstrumentsDictionaryProps['filters'],
    ): Observable<TInstrument[] | undefined> => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const { getInstruments$ } = ModuleDictionaries(ctx);
        const traceId = generateTraceId();

        return currentSocketUrl$.pipe(
            switchMap((url) =>
                isNil(url) ? EMPTY : concat(of(undefined), getInstruments$(url, traceId, filters)),
            ),
            shareReplayWithDelayedReset(minutes2milliseconds(5 as Minutes)),
        );
    },
    {
        normalize: ([, filters]) =>
            !isNil(filters)
                ? semanticHash.get(filters, {
                      statuses: semanticHash.withSorter<string>((a, b) => a.localeCompare(b)),
                      nameRegexes: semanticHash.withSorter(null),
                  })
                : 0,
        removeDelay: minutes2milliseconds(5 as Minutes),
    },
);
