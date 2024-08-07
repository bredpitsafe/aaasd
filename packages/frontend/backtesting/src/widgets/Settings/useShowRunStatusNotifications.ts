import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { useAppName } from '@frontend/common/src/hooks/useAppName';

import { EBacktestingSettings } from './def';

export const DEFAULT_SHOW_RUN_STATUS_NOTIFICATION = false;

export function useShowRunStatusNotifications() {
    const appName = useAppName();
    return useBooleanSettings(
        appName,
        EBacktestingSettings.RunStatusNotifications,
        DEFAULT_SHOW_RUN_STATUS_NOTIFICATION,
    );
}
