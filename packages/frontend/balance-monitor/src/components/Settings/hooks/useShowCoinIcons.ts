import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { useAppName } from '@frontend/common/src/hooks/useAppName';

import { EBalanceMonitorSettings } from '../def';

const DEFAULT_VALUE = true;
export function useShowCoinIcons() {
    const appName = useAppName();
    return useBooleanSettings(appName, EBalanceMonitorSettings.ShowCoinIcons, DEFAULT_VALUE);
}
