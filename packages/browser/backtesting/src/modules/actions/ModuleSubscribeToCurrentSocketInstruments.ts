import type { TGetInstrumentsDictionaryReturnType } from '@frontend/common/src/actors/Dictionaries/actions/instruments';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleDictionaries } from '@frontend/common/src/modules/dictionaries';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import { EMPTY, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const ModuleSubscribeToCurrentSocketInstruments = ModuleFactory((ctx) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const { getInstruments$ } = ModuleDictionaries(ctx);

    return dedobs(
        (): Observable<TGetInstrumentsDictionaryReturnType> => {
            const traceId = generateTraceId();

            return currentSocketUrl$.pipe(
                switchMap((url) => (isNil(url) ? EMPTY : getInstruments$(url, traceId))),
            );
        },
        {
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});
