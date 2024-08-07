import type { TimeZone } from '@common/types';
import type { TBalanceStatDaily } from '@frontend/common/src/types/domain/tradingStats';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { getPnlAssetsOrInstruments } from '../../utils/dailyPnl';
import { BalancePnlDaily } from '../Tables/BalancePnlDaily/view';

type TDailyPNLProps = {
    timeZone: TimeZone;
    balanceStats: undefined | TBalanceStatDaily[];
};

export function DailyPNL(props: TDailyPNLProps): ReactElement {
    const pnlData = useMemo(() => {
        return isNil(props.balanceStats)
            ? undefined
            : getPnlAssetsOrInstruments(props.balanceStats);
    }, [props.balanceStats]);

    return <BalancePnlDaily data={pnlData} timeZone={props.timeZone} />;
}
