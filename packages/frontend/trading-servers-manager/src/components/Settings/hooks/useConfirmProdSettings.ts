import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { useAppName } from '@frontend/common/src/hooks/useAppName';

import { ETradingServersManagerSettings } from '../def';

export const DEFAULT_CONFIRM_PROD_SETTINGS = true;
export function useConfirmProdSettings() {
    const appName = useAppName();
    return useBooleanSettings(
        appName,
        ETradingServersManagerSettings.ConfirmProdSettings,
        DEFAULT_CONFIRM_PROD_SETTINGS,
    );
}
