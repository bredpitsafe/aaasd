import { DependencyList, useCallback } from 'react';
import { firstValueFrom, Observable } from 'rxjs';

import { useModule } from '../../di/react';
import { logErrorAndFail } from '../Rx/log';
import { ModuleNotifyErrorAndFail } from '../Rx/ModuleNotify';
import { loggerReact } from '../Tracing/Children/React';

export function useObservableCallback<
    T extends (...args: any[]) => Observable<R> | Promise<Observable<R>>,
    R,
>(callback: T, deps: DependencyList): (...args: Parameters<T>) => Promise<R> {
    return useCallback(async (...args) => {
        return firstValueFrom((await callback(...args)).pipe(logErrorAndFail(loggerReact.error)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

export function useNotifiedObservableCallback<
    T extends (...args: any[]) => Observable<R> | Promise<Observable<R>>,
    R,
>(callback: T, deps: DependencyList): (...args: Parameters<T>) => Promise<R> {
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);
    return useObservableCallback<T, R>(
        (async (...args) => {
            return (await callback(...args)).pipe(notifyErrorAndFail());
        }) as T,
        deps,
    );
}
