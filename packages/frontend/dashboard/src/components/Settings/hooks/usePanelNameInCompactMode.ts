import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { useAppName } from '@frontend/common/src/hooks/useAppName';

import { EDashboardSettings } from '../def';

const DEFAULT_VALUE = true;
export function usePanelNameInCompactMode() {
    const appName = useAppName();
    return useBooleanSettings(appName, EDashboardSettings.PanelLabelInCompactMode, DEFAULT_VALUE);
}
