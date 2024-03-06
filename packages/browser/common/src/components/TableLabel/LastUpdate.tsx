import { ReactElement } from 'react';
import { useThrottle } from 'react-use';

import { pickTestProps, TWithTest } from '../../../e2e';
import { EDateTimeFormats, Milliseconds, TimeZone } from '../../types/time';
import { toDayjsWithTimezone } from '../../utils/time';
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
