import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings.ts';
import { useAppName } from '@frontend/common/src/hooks/useAppName';

import { EHerodotusSettings } from '../types';

export const useOnlyTradingInstruments = () => {
    const appName = useAppName();
    return useBooleanSettings(appName, EHerodotusSettings.TradingInstrumentsOnly, true);
};
