import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { EBalanceMonitorSettings } from '../def';

const DEFAULT_VALUE = true;
export function useShowCoinIcons() {
    return useBooleanSettings(
        EApplicationName.BalanceMonitor,
        EBalanceMonitorSettings.ShowCoinIcons,
        DEFAULT_VALUE,
    );
}
