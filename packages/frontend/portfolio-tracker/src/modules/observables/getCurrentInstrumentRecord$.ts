import { SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { TContextRef } from '@frontend/common/src/di';
import { ModuleDictionaries } from '@frontend/common/src/modules/dictionaries';
import { TInstrument, TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { concat, EMPTY, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export function getCurrentInstrumentRecord$(
    ctx: TContextRef,
    currentSocketUrl$: Observable<undefined | TSocketURL>,
): Observable<undefined | Record<TInstrumentId, TInstrument>> {
    const { getInstruments$ } = ModuleDictionaries(ctx);

    return currentSocketUrl$.pipe(
        switchMap((url) =>
            concat(
                of(undefined),
                url === undefined ? EMPTY : getInstruments$(url, generateTraceId()),
            ),
        ),
        map((instruments) => {
            if (instruments === undefined) return undefined;
            return instruments.reduce(
                (acc, instrument) => {
                    acc[instrument.id] = instrument;
                    return acc;
                },
                {} as Record<TInstrumentId, TInstrument>,
            );
        }),
        shareReplayWithDelayedReset(SHARE_RESET_DELAY),
    );
}
