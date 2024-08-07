import type {
    TCoinConvertRate,
    TCoinId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { createContext } from 'react';

export const ConvertRatesContext = createContext<
    ReadonlyMap<TCoinId, TCoinConvertRate> | undefined
>(undefined);
