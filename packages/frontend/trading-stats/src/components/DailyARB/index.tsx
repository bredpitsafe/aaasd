import type { TBaseAssetStat, TExchangeStat } from '@frontend/common/src/types/domain/tradingStats';
import type { TimeZone } from '@frontend/common/src/types/time';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import { getDailyArbData } from '../../utils/getDailyArbData';
import { ArbStatsDailyStrategies, TArbTableStrategiesProps } from '../Tables/ArbStatsDaily/view';

type TDailyARBProps = Omit<TArbTableStrategiesProps, 'data'> & {
    timeZone: TimeZone;
    exchangeStats: undefined | TExchangeStat[];
    baseAssetStats: undefined | TBaseAssetStat[];
};
export function DailyARB(props: TDailyARBProps): ReactElement {
    const arbData = useMemo(() => {
        if (!isNil(props.error)) {
            return EMPTY_ARRAY;
        }

        if (props.exchangeStats === undefined || props.baseAssetStats === undefined) {
            return;
        }

        return getDailyArbData(props.exchangeStats, props.baseAssetStats);
    }, [props.exchangeStats, props.baseAssetStats, props.error]);

    return <ArbStatsDailyStrategies data={arbData} {...props} timeZone={props.timeZone} />;
}
