import type { Milliseconds } from '@common/types';
import { EMPTY, interval, of, Subject, timer } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';

import { createEnvelope } from '../../../modules/communicationHandlers/utils';
import { documentVisibilityState$ } from '../../../utils/observable/documentVisibilityState';
import type { ISocketPlugin } from '../../Socket/def';
import type { BFFSocket } from '../BFFSocket';

export type TSendHeartbeatsOptions = {
    interval: Milliseconds;
    focusLostDelay: Milliseconds;
};

const heartbeatPayload = {
    type: 'Heartbeat',
};

export class SendHeartbeats implements ISocketPlugin {
    private destroyer$ = new Subject<void>();

    constructor(private options: TSendHeartbeatsOptions) {}

    connect(host: BFFSocket): void {
        documentVisibilityState$
            .pipe(
                switchMap((isVisible) =>
                    isVisible
                        ? of(isVisible)
                        : timer(this.options.focusLostDelay).pipe(map(() => isVisible)),
                ),
                distinctUntilChanged(),
                switchMap((isVisible) => (isVisible ? interval(this.options.interval) : EMPTY)),
                filter(() => host.isOpened()),
                takeUntil(this.destroyer$),
            )
            .subscribe(() => host.send(createEnvelope(heartbeatPayload)));
    }

    disconnect(): void {
        this.destroyer$.next();
        this.destroyer$.complete();
    }
}
