import type { TAmount, TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { createContext } from 'react';

export const BalancesContext = createContext<Record<TCoinId, TAmount> | undefined>(undefined);
