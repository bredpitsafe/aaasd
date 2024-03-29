import { isNil } from 'lodash-es';
import { useMemo, useSyncExternalStore } from 'react';
import { useUnmount } from 'react-use';
import { Observable, of, scan } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { useModule } from '../../di/react';
import { Fail } from '../../types/Fail';
import { EGrpcErrorCode } from '../../types/GrpcError';
import { logErrorAndFail } from '../Rx/log';
import { ModuleNotifyErrorAndFail } from '../Rx/ModuleNotify';
import { loggerReact } from '../Tracing/Children/React';
import { isCriticalFail } from '../ValueDescriptor/Fails';
import { ExtractSyncedValueDescriptorPayload, TValueDescriptor2 } from '../ValueDescriptor/types';
import {
    createUnsyncedValueDescriptor,
    EMPTY_VD,
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '../ValueDescriptor/utils';
import { useFunction } from './useFunction';
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

export function useValueDescriptorObservable<T extends TValueDescriptor2<any, any>>(
    obs$: Observable<T>,
): TComponentValueDescriptor<ExtractSyncedValueDescriptorPayload<T>> {
    const store = useMemo(
        () =>
            createStore(
                obs$.pipe(
                    logErrorAndFail(loggerReact.error),
                    catchError(() => of(createUnsyncedValueDescriptor(FailBrokenObservable))),
                    scan((acc, vd) => {
                        const { state, value, fail, meta } = vd;

                        return {
                            state,
                            value:
                                value ??
                                (isLoadingValueDescriptor(vd) ||
                                (!isNil(fail) && isCriticalFail(fail))
                                    ? null
                                    : acc.value),
                            fail: isSyncedValueDescriptor(vd) ? null : fail ?? acc.fail,
                            meta,
                            isBroken: fail === FailBrokenObservable,
                        } as TComponentValueDescriptor<ExtractSyncedValueDescriptorPayload<T>>;
                    }, EMPTY_CVD),
                ),
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- exclude options
        [obs$],
    );
    // protect case, when store is not call subscribe + unsubscribe
    useUnmount(store.unsubscribe);

    return useSyncExternalStore(
        store.subscribe,
        useFunction(() => store.getSnapshot() ?? EMPTY_CVD),
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
