import React, { ReactElement, ReactNode, useContext } from 'react';

import { throwingError } from '../utils/throwingError';
import { TContextRef, TModuleConstructor } from './index';

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

export function useModules<C extends TModuleConstructor<any>>(c1: C): [ReturnType<C>];
export function useModules<C extends TModuleConstructor<any>, C2 extends TModuleConstructor<any>>(
    c1: C,
    c2: C2,
): [ReturnType<C>, ReturnType<C2>];
export function useModules<
    C extends TModuleConstructor<any>,
    C2 extends TModuleConstructor<any>,
    C3 extends TModuleConstructor<any>,
>(c1: C, c2: C2, c3: C3): [ReturnType<C>, ReturnType<C2>, ReturnType<C3>];
export function useModules<
    C extends TModuleConstructor<any>,
    C2 extends TModuleConstructor<any>,
    C3 extends TModuleConstructor<any>,
    C4 extends TModuleConstructor<any>,
>(c1: C, c2: C2, c3: C3, c4: C4): [ReturnType<C>, ReturnType<C2>, ReturnType<C3>, ReturnType<C4>];
export function useModules<
    C extends TModuleConstructor<any>,
    C2 extends TModuleConstructor<any>,
    C3 extends TModuleConstructor<any>,
    C4 extends TModuleConstructor<any>,
    C5 extends TModuleConstructor<any>,
>(
    c1: C,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
): [ReturnType<C>, ReturnType<C2>, ReturnType<C3>, ReturnType<C4>, ReturnType<C5>];
export function useModules<
    C extends TModuleConstructor<any>,
    C2 extends TModuleConstructor<any>,
    C3 extends TModuleConstructor<any>,
    C4 extends TModuleConstructor<any>,
    C5 extends TModuleConstructor<any>,
    C6 extends TModuleConstructor<any>,
>(
    c1: C,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
): [ReturnType<C>, ReturnType<C2>, ReturnType<C3>, ReturnType<C4>, ReturnType<C5>, ReturnType<C6>];
export function useModules<
    C extends TModuleConstructor<any>,
    C2 extends TModuleConstructor<any>,
    C3 extends TModuleConstructor<any>,
    C4 extends TModuleConstructor<any>,
    C5 extends TModuleConstructor<any>,
    C6 extends TModuleConstructor<any>,
    C7 extends TModuleConstructor<any>,
>(
    c1: C,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
): [
    ReturnType<C>,
    ReturnType<C2>,
    ReturnType<C3>,
    ReturnType<C4>,
    ReturnType<C5>,
    ReturnType<C6>,
    ReturnType<C7>,
];
export function useModules<
    C extends TModuleConstructor<any>,
    C2 extends TModuleConstructor<any>,
    C3 extends TModuleConstructor<any>,
    C4 extends TModuleConstructor<any>,
    C5 extends TModuleConstructor<any>,
    C6 extends TModuleConstructor<any>,
    C7 extends TModuleConstructor<any>,
    C8 extends TModuleConstructor<any>,
>(
    c1: C,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
): [
    ReturnType<C>,
    ReturnType<C2>,
    ReturnType<C3>,
    ReturnType<C4>,
    ReturnType<C5>,
    ReturnType<C6>,
    ReturnType<C7>,
    ReturnType<C8>,
];
export function useModules(...constructors: TModuleConstructor<any>[]) {
    const ctx = useContextRef();
    return constructors.map((c) => c(ctx));
}
