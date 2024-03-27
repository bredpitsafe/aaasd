import { useNumberSettings } from '@frontend/common/src/components/Settings/hooks/useNumberSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { EDashboardSettings } from '../def';

const DEFAULT_VALUE = 14;
export function useLegendFontSize() {
    return useNumberSettings(
        EApplicationName.Dashboard,
        EDashboardSettings.LegendFontSize,
        DEFAULT_VALUE,
    );
}
