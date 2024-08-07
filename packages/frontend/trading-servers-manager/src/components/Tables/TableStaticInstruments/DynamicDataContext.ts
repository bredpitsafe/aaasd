import type { TInstrumentDynamicData } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createContext } from 'react';
import type { Observable } from 'rxjs';

export const DynamicDataContext = createContext<
    | undefined
    | ((instrumentId: number) => Observable<TValueDescriptor2<TInstrumentDynamicData | undefined>>)
>(undefined);
