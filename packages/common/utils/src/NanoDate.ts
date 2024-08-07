import type { ISO, Microseconds, Milliseconds, Nanoseconds, Seconds } from '@common/types';
import type { INanoDate } from '@common/types/src/primitives/INanoDate.ts';
import { isNil } from 'lodash-es';
import { NanoDate as BaseNanoDate } from 'nano-date';

import { plus } from './math.ts';
import {
    microseconds2nanoseconds,
    milliseconds2microseconds,
    seconds2milliseconds,
} from './time.ts';

export class NanoDate extends BaseNanoDate implements INanoDate {
    static from({
        unixSeconds,
        nanoseconds,
    }: {
        unixSeconds: Seconds;
        nanoseconds?: Nanoseconds;
    }): NanoDate {
        const date = new NanoDate(seconds2milliseconds(Math.trunc(unixSeconds) as Seconds));

        if (!isNil(nanoseconds)) {
            date.setNanoseconds(Math.trunc(nanoseconds));
        }

        return date;
    }

    public toISOString = (): ISO => {
        // @ts-ignore
        return this._date.toISOString() as ISO;
    };

    public toISOStringMilliseconds = (): ISO => {
        return this.toISOString();
    };

    public toISOStringMicroseconds = (): ISO => {
        const micro = this.getMicroseconds().toFixed(0);
        return this.toISOString().replace('Z', `${micro.padStart(3, '0')}Z`) as ISO;
    };

    public toISOStringNanoseconds = (): ISO => {
        const micro = this.getMicroseconds().toFixed(0);
        const nano = this.getNanoseconds().toFixed(0);
        return this.toISOString().replace(
            'Z',
            `${micro.padStart(3, '0')}${nano.padStart(3, '0')}Z`,
        ) as ISO;
    };

    public secondsOf(): Seconds {
        return Math.trunc(this.millisecondsOf() / 1000) as Seconds;
    }

    public millisecondsOf(): Milliseconds {
        return this.valueOf() as Milliseconds;
    }

    public microsecondsOf(): Microseconds {
        return plus(milliseconds2microseconds(this.millisecondsOf()), this.getMicroseconds());
    }

    public nanosecondsOf(): Nanoseconds {
        return plus(microseconds2nanoseconds(this.microsecondsOf()), this.getNanoseconds());
    }

    public isValid(): boolean {
        return !this.toDateString().startsWith('Invalid Date');
    }
}
