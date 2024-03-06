import { createContext } from 'react';

import { TBestInstrumentPrices } from '../modules/herodotusTaskIndicators';

export const BestPricesContext = createContext<TBestInstrumentPrices | undefined>(undefined);
