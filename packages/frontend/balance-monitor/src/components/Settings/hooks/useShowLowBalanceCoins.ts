import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { EBalanceMonitorSettings } from '../def';

const DEFAULT_VALUE = false;

export function useShowLowBalanceCoins() {
    return useBooleanSettings(
        EApplicationName.BalanceMonitor,
        EBalanceMonitorSettings.ShowLowBalanceCoins,
        DEFAULT_VALUE,
    );
}
