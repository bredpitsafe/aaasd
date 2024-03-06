import { exhaustMap, fromEvent, merge, share, Subject, timeout } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';

import { DEFAULT_OPTIONS } from '../../../modules/communicationHandlers/def';
import { isWindow } from '../../../utils/detect';
import { documentVisibilityState$ } from '../../../utils/observable/documentVisibilityState';
import { progressiveRetry } from '../../../utils/Rx/progressiveRetry';
import { logger as defaultLogger } from '../../../utils/Tracing';
import { Binding } from '../../../utils/Tracing/Children/Binding';
import { ESocketCloseReason, ISocketPlugin } from '../../Socket/def';
import { EWebSocketCloseCode } from '../../Socket/Socket';
import { BFFSocket } from '../BFFSocket';

const TIMEOUT_ON_OPEN = 30_000;
const MAX_RECONNECT_INTERVAL = isWindow ? 60_000 : 20_000;

export type TReconnectOnCloseOptions = {
    onReconnectStart?: (host: BFFSocket) => unknown;
    onReconnectTry?: (host: BFFSocket) => unknown;
    onReconnectSuccess?: (host: BFFSocket) => unknown;
    onReconnectFail?: (host: BFFSocket) => unknown;
};

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
            share(),
        );
        const timeoutOnOpen$ = open$.pipe(
            timeout({
                first: TIMEOUT_ON_OPEN,
                with: () => {
                    logger.info(`Timeout on open socket`);
                    throw new Error(`Socket timeout`);
                },
            }),
        );
        const errorOnClose$ = merge(close$, closing$).pipe(
            map(() => {
                logger.info(`Close socket on reconnect`);
                throw new Error(`Socket closed`);
            }),
        );

        merge(
            // Error case, just retry on error
            error$,

            // General case: socket closed by server/browser
            merge(closing$, close$).pipe(
                // If the event comes when page is closed, we should skip it and do not attempt a reconnect
                // However, start reconnecting with increased delay as soon as the page becomes visible again
                filter((event) => isSuitableEventForReconnect(event)),
            ),
        )
            .pipe(
                exhaustMap(() => {
                    logger.info(`Websocket disconnected, will attempt retries`);
                    onReconnectStart?.(host);

                    return documentVisibilityState$.pipe(
                        filter<boolean>((visible) => visible),
                        exhaustMap(() => {
                            logger.info(`Try reconnect websocket`);
                            onReconnectTry?.(host);
                            host.reconnect(ESocketCloseReason.Reconnect);

                            return merge(timeoutOnOpen$, errorOnClose$).pipe(
                                // Stop retrying when user leaves the page
                                takeUntil(
                                    documentVisibilityState$.pipe(
                                        debounceTime(10_000),
                                        filter((visible) => !visible),
                                    ),
                                ),
                            );
                        }),
                        progressiveRetry({ maxInterval: MAX_RECONNECT_INTERVAL }),
                        // Stop retrying when socket actually opens again
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

function isSuitableEventForReconnect(event: CloseEvent): boolean {
    return (
        event.code !== EWebSocketCloseCode.MANUAL_CLOSE &&
        event.code !== EWebSocketCloseCode.RECONNECT
    );
}
