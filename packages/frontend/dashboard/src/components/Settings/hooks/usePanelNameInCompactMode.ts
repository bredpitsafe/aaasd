import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { EDashboardSettings } from '../def';

const DEFAULT_VALUE = true;
export function usePanelNameInCompactMode() {
    return useBooleanSettings(
        EApplicationName.Dashboard,
        EDashboardSettings.PanelLabelInCompactMode,
        DEFAULT_VALUE,
    );
}
