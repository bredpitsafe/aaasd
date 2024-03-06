import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { EBalanceMonitorSettings } from '../def';

export const SHOW_LOCALHOST_SOCKET_DEFAULT_VALUE = false;
export function useShowLocalhostSocket() {
    return useBooleanSettings(
        EApplicationName.BalanceMonitor,
        EBalanceMonitorSettings.ShowLocalhostSocket,
        SHOW_LOCALHOST_SOCKET_DEFAULT_VALUE,
    );
}
