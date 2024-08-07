import type { TRemoteProcedureDescriptor } from '@common/rpc';
import type { Milliseconds } from '@common/types';
import { assert } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';
import { map, shareReplay } from 'rxjs';

import type { ExtractOptions, ExtractParams } from '../../utils/RPC/types.ts';
import { createObservableBox } from '../../utils/rx.ts';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types.ts';

type TSubscriptionKey = number;

type TSocketSubscriptionStateGeneric<
    T extends TValueDescriptor2<any>,
    D extends TRemoteProcedureDescriptor<any, any, any>,
> = {
    key: TSubscriptionKey;
    descriptor: D;
    valueDescriptor: T;
    params: ExtractParams<D> | undefined;
    options: ExtractOptions<D>;
    updateTime: Milliseconds;
    finished: boolean;
    removalTimerId?: number;
};

export type TSocketSubscriptionState = TSocketSubscriptionStateGeneric<
    TValueDescriptor2<any>,
    TRemoteProcedureDescriptor<any, any, any>
>;

const SUBSCRIPTION_DELETE_TIMEOUT = 10_000 as Milliseconds;

// This is a common box across all actors
const subscriptionsBox = createObservableBox<Map<TSubscriptionKey, TSocketSubscriptionState>>(
    new Map(),
);

export const createModule = () => {
    function upsertSubscription(state: TSocketSubscriptionState) {
        const map = subscriptionsBox.get();
        const value = map.get(state.key);
        map.set(state.key, state);
        subscriptionsBox.set(map);
        // Clear possible key removal if the same key is reused frequently
        if (!isNil(value?.removalTimerId)) {
            window.clearTimeout(value.removalTimerId);
        }
    }

    function deleteSubscription(
        key: TSocketSubscriptionState['key'],
        timeout = SUBSCRIPTION_DELETE_TIMEOUT,
    ) {
        const map = subscriptionsBox.get();
        const value = map.get(key);
        assert(!isNil(value), 'Cannot find subscription for delete');

        // Mark subscription as finished before removing it later.
        // This is to prevent flashing of `Request`-type endpoint data in table.
        const timerId = window.setTimeout(() => {
            map.delete(key);
            subscriptionsBox.set(map);
        }, timeout);

        upsertSubscription({ ...value, finished: true, removalTimerId: timerId });
    }

    const subscriptionsState$ = subscriptionsBox.obs.pipe(
        map((stateMap) => [...stateMap].map(([, v]) => v)),
        shareReplay(),
    );

    return { subscriptionsState$, upsertSubscription, deleteSubscription };
};
