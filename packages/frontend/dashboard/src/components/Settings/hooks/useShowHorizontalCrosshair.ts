import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { EDashboardSettings } from '../def';

const DEFAULT_VALUE = false;
export function useShowHorizontalCrosshair() {
    return useBooleanSettings(
        EApplicationName.Dashboard,
        EDashboardSettings.ShowPseudoHorizontalCrosshair,
        DEFAULT_VALUE,
    );
}
