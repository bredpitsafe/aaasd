import type { Milliseconds, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { ReactElement } from 'react';
import { useThrottle } from 'react-use';

import type { TWithTest } from '../../../e2e';
import { pickTestProps } from '../../../e2e';
import { TableLabel } from './TableLabel';

type TLastUpdateProps = {
    time: undefined | Milliseconds;
    timeZone: TimeZone;
};

type TTableLabelLastUpdateProps = TWithTest & TLastUpdateProps;

function LastUpdate({ time, timeZone }: TLastUpdateProps): ReactElement {
    return (
        <>
            {time !== undefined
                ? toDayjsWithTimezone(time, timeZone).format(EDateTimeFormats.Time)
                : '-'}
        </>
    );
}

export function TableLabelLastUpdate(props: TTableLabelLastUpdateProps): ReactElement {
    const time = useThrottle(props.time, 1_000);
    return (
        <TableLabel {...pickTestProps(props)} title="Last Update Time">
            <LastUpdate time={time} timeZone={props.timeZone} />
        </TableLabel>
    );
}
