import type { TimeZone } from '@common/types';
import type { TBaseAssetStat, TExchangeStat } from '@frontend/common/src/types/domain/tradingStats';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { getDailyArbData } from '../../utils/getDailyArbData';
import { ArbStatsDailyStrategies } from '../Tables/ArbStatsDaily/view';

type TDailyARBProps = {
    timeZone: TimeZone;
    exchangeStats: undefined | TExchangeStat[];
    baseAssetStats: undefined | TBaseAssetStat[];
};
export function DailyARB(props: TDailyARBProps): ReactElement {
    const arbData = useMemo(() => {
        if (props.exchangeStats === undefined || props.baseAssetStats === undefined) {
            return;
        }

        return getDailyArbData(props.exchangeStats, props.baseAssetStats);
    }, [props.exchangeStats, props.baseAssetStats]);

    return <ArbStatsDailyStrategies data={arbData} timeZone={props.timeZone} />;
}
