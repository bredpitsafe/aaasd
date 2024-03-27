import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { EBacktestingSettings } from './def';

export const DEFAULT_SHOW_RUN_STATUS_NOTIFICATION = false;

export function useShowRunStatusNotifications() {
    return useBooleanSettings(
        EApplicationName.BacktestingManager,
        EBacktestingSettings.RunStatusNotifications,
        DEFAULT_SHOW_RUN_STATUS_NOTIFICATION,
    );
}
