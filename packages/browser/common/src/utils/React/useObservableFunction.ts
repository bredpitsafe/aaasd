import { firstValueFrom, Observable } from 'rxjs';

import { useModule } from '../../di/react';
import { logErrorAndFail } from '../Rx/log';
import { ModuleNotifyErrorAndFail } from '../Rx/ModuleNotify';
import { loggerReact } from '../Tracing/Children/React';
import { useFunction } from './useFunction';

export function useObservableFunction<
    T extends (...args: any[]) => Observable<R> | Promise<Observable<R>>,
    R,
>(callback: T): (...args: Parameters<T>) => Promise<R> {
    return useFunction(async (...args) => {
        return firstValueFrom((await callback(...args)).pipe(logErrorAndFail(loggerReact.error)));
    });
}

export function useNotifiedObservableFunction<
    T extends (...args: any[]) => Observable<R> | Promise<Observable<R>>,
    R,
>(callback: T): (...args: Parameters<T>) => Promise<R> {
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);
    return useObservableFunction<T, R>((async (...args) => {
        return (await callback(...args)).pipe(notifyErrorAndFail());
    }) as T);
}
