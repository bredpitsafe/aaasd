import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { useAppName } from '@frontend/common/src/hooks/useAppName';

import { EBalanceMonitorSettings } from '../def';

export const SHOW_LOCALHOST_SOCKET_DEFAULT_VALUE = false;
export function useShowLocalhostSocket() {
    const appName = useAppName();
    return useBooleanSettings(
        appName,
        EBalanceMonitorSettings.ShowLocalhostSocket,
        SHOW_LOCALHOST_SOCKET_DEFAULT_VALUE,
    );
}
