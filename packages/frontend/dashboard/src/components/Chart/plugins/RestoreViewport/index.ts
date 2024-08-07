import type { Someseconds } from '@common/types';
import type { TimeseriesCharter } from '@frontend/charter/src';
import type { TBaseViewportEvent } from '@frontend/charter/src/components/ChartViewport/defs';
import { ViewportEventNS } from '@frontend/charter/src/components/ChartViewport/defs';
import type { IPlugin } from '@frontend/charter/src/plugins/Plugin';
import { fromLocalStorage, saveToLocalStorage } from '@frontend/common/src/utils/Rx/localStorage';
import { isNil } from 'lodash-es';
import { debounceTime, fromEvent, merge, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

type TRestoreData = {
    left: number;
    width: number;
    clientTimeIncrement: Someseconds;
};

const RESTORE_EVENT = 'dashboard.restore';

export class RestoreViewportPlugin implements IPlugin {
    private destroyer$ = new Subject<void>();

    constructor(private key: string) {}

    connect(host: TimeseriesCharter): void {
        const viewport = host.getViewport();

        fromLocalStorage<TRestoreData>(this.key)
            .pipe(takeUntil(this.destroyer$))
            .subscribe((data) => {
                data && restoreHost(host, data);
            });

        merge(
            fromEvent<TBaseViewportEvent>(viewport, ViewportEventNS.ApplyZoom),
            fromEvent<TBaseViewportEvent>(viewport, ViewportEventNS.ApplyMove),
        )
            .pipe(
                debounceTime(300),
                filter(() => !isNil(viewport.parent)),
                map(() => {
                    return {
                        left: viewport.getLeft(),
                        width: viewport.getScreenWidthInWorldPixels(),
                        clientTimeIncrement: host.getClientTimeIncrement(),
                    };
                }),
                saveToLocalStorage(this.key),
                takeUntil(this.destroyer$),
            )
            .subscribe();
    }

    disconnect(): void {
        this.destroyer$.next();
        this.destroyer$.complete();
    }

    destroy(): void {
        //
    }
}

function restoreHost(
    host: TimeseriesCharter,
    { width, left, clientTimeIncrement }: TRestoreData,
): void {
    const viewport = host.getViewport();
    const ratio = width / viewport.getScreenWidthInWorldPixels();

    host.setClientTimeIncrement(clientTimeIncrement);
    viewport.setScaleCenterX(viewport.scale.x / ratio, RESTORE_EVENT);
    viewport.moveLeft(left, RESTORE_EVENT);
}
