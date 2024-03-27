import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { ETradingServersManagerSettings } from '../def';

const DEFAULT_COMPACT_COMPONENTS_MENU = false;
export function useCompactComponentsMenu() {
    return useBooleanSettings(
        EApplicationName.TradingServersManager,
        ETradingServersManagerSettings.CompactComponentsMenu,
        DEFAULT_COMPACT_COMPONENTS_MENU,
    );
}
