import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { createContext } from 'react';

import type { TOverrideError } from './defs.ts';

export const OverrideContext = createContext<
    | undefined
    | {
          submitOverrideUpdate: VoidFunction;
          overrideValidation: TOverrideError[];
          instruments: TInstrument[];
      }
>(undefined);
