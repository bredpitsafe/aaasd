import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { useAppName } from '@frontend/common/src/hooks/useAppName';

import { ETradingServersManagerSettings } from '../def';

const DEFAULT_COMPACT_COMPONENTS_MENU = false;
export function useCompactComponentsMenu() {
    const appName = useAppName();
    return useBooleanSettings(
        appName,
        ETradingServersManagerSettings.CompactComponentsMenu,
        DEFAULT_COMPACT_COMPONENTS_MENU,
    );
}
