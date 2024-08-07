import type { Milliseconds } from '@common/types';
import { milliseconds2seconds } from '@common/utils';
import { EMPTY, fromEvent, merge, Subject, TimeoutError } from 'rxjs';
import { catchError, switchMap, takeUntil, timeout } from 'rxjs/operators';

import { logger } from '../../../utils/Tracing';
import type { ISocketPlugin } from '../../Socket/def';
import { ESocketCloseReason } from '../../Socket/def';
import { EWebSocketCloseCode } from '../../Socket/Socket.ts';
import type { BFFSocket } from '../BFFSocket';

export type TCloseOnTimeoutOptions = {
    delay: Milliseconds;
};

export class CloseOnTimeout implements ISocketPlugin {
    private destroyer$ = new Subject<void>();
    private options: TCloseOnTimeoutOptions;

    constructor(options: TCloseOnTimeoutOptions) {
        this.options = options;
    }

    connect(socket: BFFSocket): void {
        // Start monitoring every new opening socket (not yet connected)
        fromEvent(socket, 'opening')
            .pipe(
                switchMap(() =>
                    // Wait for the first message to arrive before timeout.
                    // If it doesn't, socket should not be left hanging and must be closed
                    merge(fromEvent(socket, 'envelope'), fromEvent(socket, 'partial')).pipe(
                        // If the socket has received first message, it must continue to receive heartbeats from the server forever
                        // If it misses some messages for a specified interval, it must be destroyed as well.
                        timeout(this.options.delay),
                        catchError((err) => {
                            if (err instanceof TimeoutError) {
                                // Disconnect socket after timeout expires
                                logger.info(
                                    `[CloseOnTimeout] Disconnect socket with no messages after ${milliseconds2seconds(
                                        this.options.delay,
                                    )}s, socket: "${socket.url}"`,
                                );
                                socket.disconnect(
                                    EWebSocketCloseCode.OFFLINE,
                                    ESocketCloseReason.NoMessages,
                                    false,
                                );
                            }
                            return EMPTY;
                        }),
                    ),
                ),
                takeUntil(this.destroyer$),
            )
            .subscribe();
    }

    disconnect() {
        this.destroyer$.next();
        this.destroyer$.complete();
    }
}
