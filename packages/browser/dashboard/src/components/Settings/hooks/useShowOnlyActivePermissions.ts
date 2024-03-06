import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { EDashboardSettings } from '../def';

const DEFAULT_VALUE = false;
export function useShowOnlyActivePermissions() {
    return useBooleanSettings(
        EApplicationName.Dashboard,
        EDashboardSettings.ShowOnlyActivePermissions,
        DEFAULT_VALUE,
    );
}
