import {
    TBalanceStatDaily,
    TDailyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import { getPnlAssets } from '../../utils/dailyPnl';
import { BalancePnlDaily, TBalancePnlDailyProps } from '../Tables/BalancePnlDaily/view';

type TDailyPNLProps = Omit<TBalancePnlDailyProps, 'data'> & {
    filter: undefined | TDailyStatsFilter;
    balanceStats: undefined | TBalanceStatDaily[];
};
export function DailyPNL(props: TDailyPNLProps): ReactElement {
    const pnlData = useMemo(() => {
        if (!isNil(props.error)) {
            return EMPTY_ARRAY;
        }

        if (props.balanceStats === undefined) {
            return;
        }
        return getPnlAssets(props.balanceStats);
    }, [props.balanceStats, props.error]);

    return <BalancePnlDaily data={pnlData} {...props} />;
}
