import type { Nil } from '@common/types';
import { createContext } from 'react';

import type { TBestInstrumentPrices } from '../modules/ModuleHerodotusTaskIndicators.ts';

export const BestPricesContext = createContext<Nil | TBestInstrumentPrices>(undefined);
