import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { EDashboardSettings } from '../def';

const DEFAULT_VALUE = true;
export function usePanelDeleteConfirmSettings() {
    return useBooleanSettings(
        EApplicationName.Dashboard,
        EDashboardSettings.PanelDeleteConfirm,
        DEFAULT_VALUE,
    );
}
