import { isUndefined } from 'lodash-es';
import { useMemo, useSyncExternalStore } from 'react';
import { useUnmount } from 'react-use';
import { Observable } from 'rxjs';

import { ValueDescriptor } from '../../types/ValueDescriptor';
import { assert } from '../assert';
import { useFunction } from './useFunction';
import { createStore } from './useSyncObservable';

/**
 * @deprecated
 */
export function useValueDescriptorObservableDeprecated<T extends ValueDescriptor<any, any, any>>(
    obs$: Observable<T>,
): T {
    const store = useMemo(() => createStore(obs$), [obs$]);
    // protect case, when store is not call subscribe + unsubscribe
    useUnmount(store.unsubscribe);
    const getSnapshot = useFunction(() => {
        const snapshot = store.getSnapshot();
        assert(
            !isUndefined(snapshot),
            '[useValueDescriptorObservable] Initial value must be provided',
        );
        return snapshot;
    });
    return useSyncExternalStore(store.subscribe, getSnapshot);
}
