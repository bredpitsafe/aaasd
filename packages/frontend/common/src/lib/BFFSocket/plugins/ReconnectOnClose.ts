import { combineLatest, fromEvent, merge, Subject } from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
    tap,
    throttleTime,
} from 'rxjs/operators';

import { DEFAULT_OPTIONS } from '../../../modules/communicationHandlers/def';
import { networkStatus } from '../../../modules/networkStatus';
import { documentVisibilityState$ } from '../../../utils/observable/documentVisibilityState';
import { logger as defaultLogger } from '../../../utils/Tracing';
import { Binding } from '../../../utils/Tracing/Children/Binding';
import type { ISocketPlugin } from '../../Socket/def';
import { ESocketCloseReason } from '../../Socket/def';
import { EWebSocketCloseCode } from '../../Socket/Socket.ts';
import type { BFFSocket } from '../BFFSocket';

export type TReconnectOnCloseOptions = {
    onReconnectStart?: (host: BFFSocket) => unknown;
    onReconnectTry?: (host: BFFSocket) => unknown;
    onReconnectSuccess?: (host: BFFSocket) => unknown;
    onReconnectFail?: (host: BFFSocket) => unknown;
};

const THROTTLE_RECONNECT_TIMEOUT = 3_000;

export class ReconnectOnClose implements ISocketPlugin {
    private options: TReconnectOnCloseOptions;
    private destroyer$ = new Subject<void>();

    constructor(options: TReconnectOnCloseOptions = {}) {
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    }

    connect(host: BFFSocket): void {
        const logger = defaultLogger.child(new Binding(`ReconnectOnClose|${host.url}`));
        const { onReconnectStart, onReconnectTry, onReconnectSuccess } = this.options;

        const closing$ = fromEvent(host, 'closing', (v) => v as CloseEvent);
        const close$ = fromEvent(host, `close`, (v) => v as CloseEvent);
        const error$ = fromEvent(host, `error`, (v) => v as Event);
        const open$ = fromEvent(host, 'open', (v) => v as Event).pipe(
            tap(() => {
                logger.info(`Successful socket reconnect`);
                onReconnectSuccess?.(host);
            }),
        );

        // General case: socket errored, started closing or has closed.
        merge(error$, closing$, close$)
            .pipe(
                throttleTime(THROTTLE_RECONNECT_TIMEOUT, undefined, {
                    leading: true,
                    trailing: true,
                }),
                // Filter out non-reconnectable events
                filter((event) => {
                    logger.info(
                        `Received websocket termination event, code:`,
                        'code' in event ? event.code : undefined,
                    );
                    let decision = true;
                    if (
                        event instanceof CloseEvent &&
                        [
                            EWebSocketCloseCode.MANUAL_CLOSE, // Socket has been closed manually
                            EWebSocketCloseCode.RECONNECT, // Socket has been closed with the intent to reconnect immediately
                            EWebSocketCloseCode.DESTROY, // Socket is being completely destroyed
                        ].includes(event.code)
                    ) {
                        logger.info(`Websocket termination event is not reconnectable, skipping`);
                        decision = false;
                    }

                    return decision;
                }),
                switchMap(() => {
                    logger.info(`Websocket disconnected, will attempt retries`);
                    onReconnectStart?.(host);

                    return combineLatest([networkStatus.online$, documentVisibilityState$]).pipe(
                        // If the event comes when page is closed, we should skip it and do not attempt a reconnect
                        // If the event comes when we're definitely offline, we should skip it and do not attempt a reconnect
                        map(([online, visible]) => {
                            logger.info(
                                `Websocket reconnect attempt conditions: online: ${online}, visible: ${visible}`,
                            );
                            return online && visible;
                        }),
                        distinctUntilChanged(),
                        filter((canReconnect) => canReconnect),
                        tap(() => {
                            logger.info(`Try reconnect websocket`);
                            onReconnectTry?.(host);
                            host.reconnect(ESocketCloseReason.Reconnect);
                        }),
                        // Stay in the inner observable until the socket has been opened again
                        takeUntil(open$),
                    );
                }),
                // Stop the subscription altogether when the socket is destroyed
                takeUntil(this.destroyer$),
            )
            .subscribe();
    }

    disconnect(): void {
        this.destroyer$.next();
        this.destroyer$.complete();
    }
}
