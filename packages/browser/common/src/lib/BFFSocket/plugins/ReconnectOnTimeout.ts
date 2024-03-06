import { fromEvent, merge, Subject } from 'rxjs';
import { catchError, takeUntil, timeout } from 'rxjs/operators';

import { Milliseconds } from '../../../types/time';
import { progressiveRetry } from '../../../utils/Rx/progressiveRetry';
import { milliseconds2seconds } from '../../../utils/time';
import { logger } from '../../../utils/Tracing';
import type { ISocketPlugin } from '../../Socket/def';
import { ESocketCloseReason } from '../../Socket/def';
import { BFFSocket } from '../BFFSocket';

export type TCloseOnTimeoutOptions = {
    delay: Milliseconds;
};

export class ReconnectOnTimeout implements ISocketPlugin {
    private destroyer$ = new Subject<void>();
    private options: TCloseOnTimeoutOptions;

    constructor(options: TCloseOnTimeoutOptions) {
        this.options = options;
    }

    connect(socket: BFFSocket): void {
        merge(fromEvent(socket, 'envelope'), fromEvent(socket, 'partial'))
            .pipe(
                timeout(this.options.delay),
                catchError((err, caught) => {
                    // Reconnect socket after timeout expires
                    socket.reconnect(ESocketCloseReason.NoMessages);
                    logger.info(
                        `[ReconnectOnTimeout] Reconnect socket on timeout after ${milliseconds2seconds(
                            this.options.delay,
                        )}s, socket: "${socket.url}"`,
                    );

                    return caught;
                }),
                progressiveRetry(),
                takeUntil(merge(fromEvent(socket, 'closing'), fromEvent(socket, 'close'))),
                takeUntil(this.destroyer$),
            )
            .subscribe();
    }

    disconnect() {
        this.destroyer$.next();
        this.destroyer$.complete();
    }
}
