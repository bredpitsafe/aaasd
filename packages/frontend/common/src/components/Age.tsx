import type { ISO, Milliseconds } from '@common/types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

type TTimeLike = ISO | Milliseconds | Date | Dayjs;

type TAgeProps = {
    timestamp: TTimeLike;
    baseTime?: TTimeLike;
};

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
    relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: '%d seconds',
        m: '1 minute',
        mm: '%d minutes',
        h: '1 hour',
        hh: '%d hours',
        d: '1 day',
        dd: '%d days',
        M: '1 month',
        MM: '%d months',
        y: '1 year',
        yy: '%d years',
    },
});

export function Age(props: TAgeProps): ReactElement {
    return <>{formatValue(props.timestamp, props.baseTime)}</>;
}

function formatValue(value: TTimeLike, baseTime?: TTimeLike): string {
    const valueAsDate = dayjs(value);

    return isNil(baseTime) || baseTime === 0
        ? valueAsDate.toNow(true)
        : valueAsDate.to(baseTime, true);
}
