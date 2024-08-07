import type { Milliseconds } from '@common/types';
import { getNowMilliseconds, iso2milliseconds, minus } from '@common/utils';
import { fromEvent, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import type { ISocketPlugin } from '../../Socket/def';
import type { BFFSocket } from '../BFFSocket';
import type { THeader } from '../def';

export class ServerTimePlugin implements ISocketPlugin {
    private destroyer$ = new Subject<void>();

    constructor(private onUpdate: (diff: Milliseconds) => void) {}

    connect(host: BFFSocket): void {
        fromEvent(host, 'envelope', (envelope) => envelope as THeader)
            .pipe(
                map(({ timestamp }) => {
                    const serverTimestamp = iso2milliseconds(timestamp);
                    const clientTimestamp = getNowMilliseconds();

                    return minus(serverTimestamp, clientTimestamp);
                }),
                takeUntil(this.destroyer$),
            )
            .subscribe(this.onUpdate);
    }

    disconnect = (): void => {
        this.destroyer$.next();
        this.destroyer$.complete();
    };
}
