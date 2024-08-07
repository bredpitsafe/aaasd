import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { useAppName } from '@frontend/common/src/hooks/useAppName';

import { EDashboardSettings } from '../def';

const DEFAULT_VALUE = true;
export function usePanelDeleteConfirmSettings() {
    const appName = useAppName();
    return useBooleanSettings(appName, EDashboardSettings.PanelDeleteConfirm, DEFAULT_VALUE);
}
