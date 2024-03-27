import { useModule } from '@frontend/common/src/di/react';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { useCoinSelectionTabs } from '../../components/Settings/hooks/useCoinSelectionTabs';
import type { EBalanceMonitorLayoutComponents } from '../../layouts/defs';
import { ModuleActiveCoin } from '../../modules/ModuleActiveCoin';

export function useConnectedActiveCoin(
    tab?: EBalanceMonitorLayoutComponents,
): [TCoinId | undefined, (value: TCoinId | undefined) => Promise<void>] {
    const { activeCoin$, setActiveCoin } = useModule(ModuleActiveCoin);

    const coin = useSyncObservable(activeCoin$);

    const [tabs] = useCoinSelectionTabs();

    const syncTabWithActiveCoin = useMemo(
        () => isNil(tab) || (tabs?.includes(tab) ?? false),
        [tabs, tab],
    );

    const settingsCoin = syncTabWithActiveCoin ? coin : undefined;

    const [ownCoin, setOwnCoin] = useSyncState(settingsCoin, [settingsCoin]);

    return [
        ownCoin,
        useFunction(async (coin: TCoinId | undefined) => {
            setOwnCoin(coin);
            if (syncTabWithActiveCoin) {
                await setActiveCoin(coin);
            }
        }),
    ];
}
