import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { EDashboardSettings } from '../def';

const DEFAULT_VALUE = false;
export function usePanelDefaultCollapseSettings() {
    return useBooleanSettings(
        EApplicationName.Dashboard,
        EDashboardSettings.PanelDefaultCollapsed,
        DEFAULT_VALUE,
    );
}
