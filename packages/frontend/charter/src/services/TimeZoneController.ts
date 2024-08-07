import type { Someseconds } from '@common/types';
import { ReplaySubject } from 'rxjs';

import type { IContext } from '../types';

export class TimeZoneController {
    timeZone$ = new ReplaySubject<Someseconds>(1);

    constructor(private ctx: IContext) {
        this.timeZone$.next(this.ctx.state.timeZone);
    }

    destroy(): void {
        this.timeZone$.complete();
    }

    setTimeZone(timezone: Someseconds) {
        if (this.ctx.state.timeZone !== timezone) {
            this.ctx.state.timeZone = timezone;
            this.timeZone$.next(timezone);
        }
    }

    getTimeZone(): Someseconds {
        return this.ctx.state.timeZone;
    }
}
