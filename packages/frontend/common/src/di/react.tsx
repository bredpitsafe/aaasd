import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';

import { throwingError } from '../utils/throwingError';
import type { TContextRef } from './index';

export const Context = React.createContext<{ contextId: undefined | TContextRef }>({
    contextId: undefined,
});

type DIProviderProps = { context: TContextRef; children?: ReactNode };

export const DIProvider = (props: DIProviderProps): ReactElement => {
    return (
        <Context.Provider value={{ contextId: props.context }}>{props.children}</Context.Provider>
    );
};

export function useContextRef(): TContextRef {
    const { contextId } = useContext(Context);
    return contextId ?? throwingError('ContextRef is not defined');
}

export function useModule<R>(constructor: (ref: TContextRef) => R): R {
    return constructor(useContextRef());
}
