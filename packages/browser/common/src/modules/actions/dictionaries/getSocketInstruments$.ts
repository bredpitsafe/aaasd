import { isNil } from 'lodash-es';
import { concat, EMPTY, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import { TInstrument } from '../../../types/domain/instrument';
import { Minutes } from '../../../types/time';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { minutes2milliseconds } from '../../../utils/time';
import { generateTraceId } from '../../../utils/traceId';
import { ModuleDictionaries } from '../../dictionaries';
import { ModuleSocketPage } from '../../socketPage';

export const getSocketInstrumentsDedobsed$ = dedobs(
    (ctx: TContextRef): Observable<TInstrument[] | undefined> => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const { getInstruments$ } = ModuleDictionaries(ctx);
        const traceId = generateTraceId();

        return currentSocketUrl$.pipe(
            switchMap((url) =>
                isNil(url) ? EMPTY : concat(of(undefined), getInstruments$(url, traceId)),
            ),
            shareReplayWithDelayedReset(minutes2milliseconds(5 as Minutes)),
        );
    },
    {
        removeDelay: minutes2milliseconds(5 as Minutes),
    },
);
