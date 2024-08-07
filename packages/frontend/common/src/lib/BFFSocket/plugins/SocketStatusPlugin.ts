import { fromEvent, merge, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, tap } from 'rxjs/operators';

import { logger } from '../../../utils/Tracing';
import type { ISocketPlugin } from '../../Socket/def';
import type { BFFSocket } from '../BFFSocket';

export const HEARTBEAT_TIMEOUT = 3_000;

export enum ESocketStatus {
    Unknown = 'Unknown',
    Stable = 'Stable',
    Unstable = 'Unstable',
    Disconnected = 'Disconnected',
}

export enum EUpdateReason {
    Opening = 'Opening',
    Opened = 'Opened',
    Closed = 'Closed',
    Failed = 'Failed',
    Message = 'Message',
    Timeout = 'Timeout',
    Destroyed = 'Destroyed',
}

export type TSocketStatusUpdate = {
    reason: EUpdateReason;
    status: ESocketStatus;
};

export class SocketStatusPlugin implements ISocketPlugin {
    private destroy$ = new Subject<void>();
    private update$ = new Subject<[BFFSocket, TSocketStatusUpdate]>();

    constructor(private onUpdate: (update: TSocketStatusUpdate) => void) {
        this.update$
            .pipe(
                takeUntil(this.destroy$),
                distinctUntilChanged(
                    ([, a], [, b]) => a.status === b.status && a.reason === b.reason,
                ),
            )
            .subscribe(([socket, update]) => {
                logger.info(
                    `[SocketStatusPlugin] Update socket status to "${update.status}", socket: "${socket.url}"`,
                );
                this.onUpdate(update);
            });
    }

    connect(host: BFFSocket): void {
        const updateOperator = <T>(getUpdate: () => TSocketStatusUpdate) =>
            tap<T>(() => this.update$.next([host, getUpdate()]));

        const open$ = fromEvent(host, 'open');

        const close$ = merge(fromEvent(host, 'closing'), fromEvent(host, 'close')).pipe(
            updateOperator(getCloseUpdate),
        );

        const error$ = fromEvent(host, 'error').pipe(updateOperator(getErrorUpdate));
        this.update$.next([host, getOpeningUpdate()]);

        open$
            .pipe(
                updateOperator(getOpenedUpdate),
                switchMap(() =>
                    merge(fromEvent(host, 'envelope'), fromEvent(host, 'partial')).pipe(
                        updateOperator(getStableUpdate),
                        debounceTime(HEARTBEAT_TIMEOUT),
                        updateOperator(getUnstableUpdate),
                        takeUntil(close$),
                        takeUntil(error$),
                    ),
                ),
                takeUntil(this.destroy$),
            )
            .subscribe();
    }

    disconnect(host: BFFSocket): void {
        this.update$.next([host, getDestroyedUpdate()]);
        this.destroy$.next();
        this.destroy$.complete();
    }
}

function getOpeningUpdate() {
    return {
        reason: EUpdateReason.Opening,
        status: ESocketStatus.Unknown,
    };
}

function getOpenedUpdate() {
    return {
        reason: EUpdateReason.Opened,
        status: ESocketStatus.Stable,
    };
}

function getCloseUpdate() {
    return {
        reason: EUpdateReason.Closed,
        status: ESocketStatus.Disconnected,
    };
}

function getErrorUpdate() {
    return {
        reason: EUpdateReason.Failed,
        status: ESocketStatus.Disconnected,
    };
}

function getStableUpdate() {
    return {
        reason: EUpdateReason.Message,
        status: ESocketStatus.Stable,
    };
}

function getUnstableUpdate() {
    return {
        reason: EUpdateReason.Timeout,
        status: ESocketStatus.Unstable,
    };
}

function getDestroyedUpdate() {
    return {
        reason: EUpdateReason.Destroyed,
        status: ESocketStatus.Disconnected,
    };
}
