import { useBooleanSettings } from '@frontend/common/src/components/Settings/hooks/useBooleanSettings.ts';
import { EApplicationName } from '@frontend/common/src/types/app.ts';

import { EHerodotusSettings } from '../types';

export const useOnlyTradingInstruments = () =>
    // TODO: Use EApplicationName from app context when it's available
    // @see https://bhft-company.atlassian.net/browse/FRT-2235
    useBooleanSettings(
        EApplicationName.HerodotusTerminal,
        EHerodotusSettings.TradingInstrumentsOnly,
        true,
    );
