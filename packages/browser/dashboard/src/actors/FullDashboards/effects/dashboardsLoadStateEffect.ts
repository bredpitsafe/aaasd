import { EDataLoadState } from '@frontend/common/src/types/loadState';
import { merge, Observable, of } from 'rxjs';
import { mapTo, startWith } from 'rxjs/operators';
import type { EnvelopeTransmitter } from 'webactor';

import { getDashboardsLoadStateEnvBox } from '../envelope';

export function dashboardsLoadStateEffect(
    context: EnvelopeTransmitter,
    loadedModules$: Observable<unknown>,
) {
    getDashboardsLoadStateEnvBox.responseStream(context, () =>
        merge(
            of(EDataLoadState.Loading),
            loadedModules$.pipe(startWith(EDataLoadState.Loading), mapTo(EDataLoadState.Loaded)),
        ),
    );
}
