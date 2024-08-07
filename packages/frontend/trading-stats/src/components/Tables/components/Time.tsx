import type { Milliseconds, TimeZone } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import { ETradingStatsTimeFormat } from '@frontend/common/src/types/domain/tradingStats';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

type TTimeProps = {
    timestamp: Milliseconds | null;
    timeZone: TimeZone;
    format?: string;
};

export function Time(props: TTimeProps): ReactElement {
    const value = useMemo(
        () =>
            props.timestamp !== null
                ? toDayjsWithTimezone(props.timestamp, props.timeZone).format(
                      props.format || ETradingStatsTimeFormat.Time,
                  )
                : '--:--:--',
        [props.format, props.timestamp, props.timeZone],
    );

    return <>{value}</>;
}
