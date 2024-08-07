import { useModule } from '@frontend/common/src/di/react';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { EMPTY_STRING } from '@frontend/common/src/utils/const';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import type { ReactElement } from 'react';

import type { TTradesTableFullProps } from '../Tables/TradesTableFull/defs';
import { TradesTableFull } from '../Tables/TradesTableFull/view';

type TDailyTradesProps = Omit<TTradesTableFullProps, 'exportFilename'>;
export function DailyTrades(props: TDailyTradesProps): ReactElement {
    const { currentSocketName$ } = useModule(ModuleCommunication);

    const socketName = useSyncObservable(currentSocketName$) || EMPTY_STRING;

    return <TradesTableFull exportFilename={`Daily_Trades[socket ${socketName}]`} {...props} />;
}
