import { createContext } from 'react';

export const DirtyKeysContext = createContext<
    | {
          dirtyKeysSet: Set<string>;
          resetRowEdited: (key: string) => void;
      }
    | undefined
>(undefined);
