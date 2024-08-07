import { isNil } from 'lodash-es';
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import type { Observable } from 'rxjs';
import { of, scan } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { useModule } from '../../di/react';
import { Fail } from '../../types/Fail';
import { EGrpcErrorCode } from '../../types/GrpcError';
import { logErrorAndFail } from '../Rx/log';
import { ModuleNotifyErrorAndFail } from '../Rx/ModuleNotify';
import { loggerReact } from '../Tracing/Children/React';
import { isCriticalFail } from '../ValueDescriptor/Fails';
import type {
    ExtractSyncedValueDescriptorPayload,
    TValueDescriptor2,
} from '../ValueDescriptor/types';
import {
    createUnsyncedValueDescriptor,
    EMPTY_VD,
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '../ValueDescriptor/utils';
import { createStore } from './useSyncObservable';

export type TComponentValueDescriptor<T> = TValueDescriptor2<T> & {
    isBroken: boolean;
};

const FailBrokenObservable = Fail(EGrpcErrorCode.INTERNAL, {
    message: 'Observable closed with error',
});

const EMPTY_CVD: TComponentValueDescriptor<any> = {
    ...EMPTY_VD,
    isBroken: false,
};

const DEFAULT_OPTIONS = {
    valueSurviveLoading: false,
    valueSurviveCriticalFail: false,
};

export function useValueDescriptorObservable<T extends TValueDescriptor2<any, any>>(
    obs$: Observable<T>,
    options?: {
        valueSurviveLoading?: boolean;
        valueSurviveCriticalFail?: boolean;
    },
): TComponentValueDescriptor<ExtractSyncedValueDescriptorPayload<T>> {
    const { valueSurviveLoading, valueSurviveCriticalFail } = useMemo(
        () => ({ ...DEFAULT_OPTIONS, ...options }),
        [options],
    );

    const store = useMemo(() => {
        return createStore(
            obs$.pipe(
                logErrorAndFail(loggerReact.error),
                catchError(() => of(createUnsyncedValueDescriptor(FailBrokenObservable))),
                scan((acc, vd) => {
                    const { state, value, fail, meta } = vd;
                    return {
                        state,
                        value:
                            value ??
                            ((!valueSurviveLoading && isLoadingValueDescriptor(vd)) ||
                            (!isNil(fail) && !valueSurviveCriticalFail && isCriticalFail(fail))
                                ? null
                                : acc.value),
                        fail: isSyncedValueDescriptor(vd) ? null : fail ?? acc.fail,
                        meta,
                        isBroken: fail === FailBrokenObservable,
                    } as TComponentValueDescriptor<ExtractSyncedValueDescriptorPayload<T>>;
                }, EMPTY_CVD),
            ),
        );
    }, [obs$, valueSurviveLoading, valueSurviveCriticalFail]);

    // protect case, when store is not call subscribe + unsubscribe
    useEffect(() => {
        return () => {
            store.unsubscribe();
        };
    }, [store]);

    return useSyncExternalStore(
        store.subscribe,
        useCallback(() => store.getSnapshot() ?? EMPTY_CVD, [store]),
    );
}

export function useValueDescriptorObservableWithoutPrev<T extends TValueDescriptor2<any, any>>(
    obs$: Observable<T>,
): TComponentValueDescriptor<ExtractSyncedValueDescriptorPayload<T>> {
    const store = useMemo(() => {
        return createStore(
            obs$.pipe(
                logErrorAndFail(loggerReact.error),
                catchError(() => of(createUnsyncedValueDescriptor(FailBrokenObservable))),
                scan((acc, vd) => {
                    const { state, value, fail, meta } = vd;
                    return {
                        state,
                        value,
                        fail: isSyncedValueDescriptor(vd) ? null : fail ?? acc.fail,
                        meta,
                        isBroken: fail === FailBrokenObservable,
                    } as TComponentValueDescriptor<ExtractSyncedValueDescriptorPayload<T>>;
                }, EMPTY_CVD),
            ),
        );
    }, [obs$]);

    // protect case, when store is not call subscribe + unsubscribe
    useEffect(() => {
        return () => {
            store.unsubscribe();
        };
    }, [store]);

    return useSyncExternalStore(
        store.subscribe,
        useCallback(() => store.getSnapshot() ?? EMPTY_CVD, [store]),
    );
}

export function useNotifiedValueDescriptorObservable<T extends TValueDescriptor2<any, any>>(
    obs$: Observable<T>,
): TComponentValueDescriptor<ExtractSyncedValueDescriptorPayload<T>> {
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);
    return useValueDescriptorObservable(
        useMemo(() => obs$.pipe(notifyErrorAndFail()), [obs$, notifyErrorAndFail]),
    );
}

export function useNotifiedValueDescriptorObservableWithoutPrev<
    T extends TValueDescriptor2<any, any>,
>(obs$: Observable<T>): TComponentValueDescriptor<ExtractSyncedValueDescriptorPayload<T>> {
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);
    return useValueDescriptorObservableWithoutPrev(
        useMemo(() => obs$.pipe(notifyErrorAndFail()), [obs$, notifyErrorAndFail]),
    );
}
