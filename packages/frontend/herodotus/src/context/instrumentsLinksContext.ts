import { createContext } from 'react';

export const InstrumentsLinksContext = createContext<ReadonlyMap<string, string> | undefined>(
    undefined,
);
