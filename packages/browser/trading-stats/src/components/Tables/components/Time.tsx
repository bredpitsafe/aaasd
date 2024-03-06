import { ETradingStatsTimeFormat } from '@frontend/common/src/types/domain/tradingStats';
import type { Milliseconds, TimeZone } from '@frontend/common/src/types/time';
import { toDayjsWithTimezone } from '@frontend/common/src/utils/time';
import { ReactElement, useMemo } from 'react';

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
