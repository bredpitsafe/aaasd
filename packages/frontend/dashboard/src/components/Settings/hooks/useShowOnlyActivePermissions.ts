import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { useAppName } from '@frontend/common/src/hooks/useAppName';

import { EDashboardSettings } from '../def';

const DEFAULT_VALUE = false;
export function useShowOnlyActivePermissions() {
    const appName = useAppName();
    return useBooleanSettings(appName, EDashboardSettings.ShowOnlyActivePermissions, DEFAULT_VALUE);
}
