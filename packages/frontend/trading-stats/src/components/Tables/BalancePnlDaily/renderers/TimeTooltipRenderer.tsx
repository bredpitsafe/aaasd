import type { Milliseconds, TimeZone } from '@common/types';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { ETradingStatsTimeFormat } from '@frontend/common/src/types/domain/tradingStats';
import type { ReactElement } from 'react';
import { memo } from 'react';

import { Time } from '../../components/Time';
import type { TBalancePnlDailyAsset } from '../types';

type TTimeTooltipRendererProps = ICellRendererParams<TBalancePnlDailyAsset> & {
    timestamp?: Milliseconds | null;
};

export const createTimeTooltipRenderer = (timeZone: TimeZone) =>
    memo((props: TTimeTooltipRendererProps): ReactElement | null => {
        if (props.timestamp === undefined) {
            return <>{props.valueFormatted}</>;
        }

        return (
            <Tooltip
                title={
                    <Time
                        timestamp={props.timestamp}
                        timeZone={timeZone}
                        format={ETradingStatsTimeFormat.DateTimeWithoutYear}
                    />
                }
            >
                {props.valueFormatted}
            </Tooltip>
        );
    });
