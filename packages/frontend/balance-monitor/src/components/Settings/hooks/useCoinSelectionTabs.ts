import { useListSettings } from '@frontend/common/src/components/Settings/hooks/useListSettings';

import { EBalanceMonitorLayoutComponents } from '../../../layouts/defs';
import { EBalanceMonitorSettings } from '../def';

export const ALL_TABS_WITH_COINS: EBalanceMonitorLayoutComponents[] = [
    EBalanceMonitorLayoutComponents.Distribution,
    EBalanceMonitorLayoutComponents.TransfersHistory,
    EBalanceMonitorLayoutComponents.SuggestedTransfers,
];

const DEFAULT_VALUE: EBalanceMonitorLayoutComponents[] = [
    EBalanceMonitorLayoutComponents.Distribution,
];

export function useCoinSelectionTabs() {
    return useListSettings<EBalanceMonitorLayoutComponents>(
        EBalanceMonitorSettings.CoinSelectionTabs,
        DEFAULT_VALUE,
    );
}
