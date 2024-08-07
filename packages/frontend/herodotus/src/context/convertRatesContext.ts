import type { TUseConvertRateReturnType } from '@frontend/common/src/components/hooks/useConvertRates.ts';
import { createContext } from 'react';

export const ConvertRatesContext = createContext<TUseConvertRateReturnType>({
    convertRatesMap: undefined,
    loading: false,
});
