import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { EnvelopeTransmitter } from 'webactor';

import { dashboardUpdateProgressSetEnvBox } from '../envelope';
import type { UpdateProgress } from './utils/UpdateProgress';

export function dashboardUpdateProgressEffect(
    context: EnvelopeTransmitter,
    updateProgress$: Observable<UpdateProgress>,
) {
    dashboardUpdateProgressSetEnvBox.responseStream(context, () =>
        updateProgress$.pipe(map((updates) => updates.getAllUpdates())),
    );
}
