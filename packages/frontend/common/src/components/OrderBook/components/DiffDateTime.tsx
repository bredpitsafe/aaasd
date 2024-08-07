import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import type { NanoDate } from '@common/utils';
import { formatNanoDate } from '@common/utils';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { getEqualParts } from '../utils';
import { styleHighlightChangedText, styleNavigationLabelValue } from './style.css';

type TDiffDateTimeProps = {
    leftTime?: NanoDate;
    rightTime?: NanoDate;
    timeZone: TimeZone;
};

export const DiffDateTime = memo(({ leftTime, rightTime, timeZone }: TDiffDateTimeProps) => {
    const snapshot = useMemo(
        () =>
            isNil(leftTime)
                ? undefined
                : formatNanoDate(leftTime, EDateTimeFormats.DateTimeNanoseconds, timeZone),
        [timeZone, leftTime],
    );

    const update = useMemo(
        () =>
            isNil(rightTime)
                ? undefined
                : formatNanoDate(rightTime, EDateTimeFormats.DateTimeNanoseconds, timeZone),
        [timeZone, rightTime],
    );

    const diff = useMemo(() => getEqualParts(snapshot, update), [snapshot, update]);

    const left = useMemo(
        () =>
            isNil(diff) ? (
                snapshot ?? '—'
            ) : (
                <>
                    <span className={styleHighlightChangedText}>{diff.equal}</span>
                    <span>{diff.left}</span>
                </>
            ),
        [diff, snapshot],
    );

    const right = useMemo(
        () =>
            isNil(diff) ? (
                update ?? '—'
            ) : (
                <>
                    <span className={styleHighlightChangedText}>{diff.equal}</span>
                    <span>{diff.right}</span>
                </>
            ),
        [diff, update],
    );

    return (
        <>
            <span className={styleNavigationLabelValue}>{left}</span>
            <span className={styleNavigationLabelValue}>{right}</span>
        </>
    );
});
