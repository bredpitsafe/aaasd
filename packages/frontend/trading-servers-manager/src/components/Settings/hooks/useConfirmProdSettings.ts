import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings';
import { EApplicationName } from '@frontend/common/src/types/app';

import { ETradingServersManagerSettings } from '../def';

export const DEFAULT_CONFIRM_PROD_SETTINGS = true;
export function useConfirmProdSettings() {
    return useBooleanSettings(
        EApplicationName.TradingServersManager,
        ETradingServersManagerSettings.ConfirmProdSettings,
        DEFAULT_CONFIRM_PROD_SETTINGS,
    );
}
