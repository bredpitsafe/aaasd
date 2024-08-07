import type { TSubscriptionEvent } from '@common/rx';
import { createUpdateEvent, isSubscriptionEventSubscribed } from '@common/rx';
import type { ISO } from '@common/types';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { delayEmit, EDelayEmitType } from './Rx/delayEmit';
import { distinctValueDescriptorUntilChanged, mapValueDescriptor } from './Rx/ValueDescriptor2';
import type { UnifierWithCompositeHash } from './unifierWithCompositeHash';
import { getCachedArrayFromUnifier } from './unifierWithCompositeHash';
import type { TValueDescriptor2 } from './ValueDescriptor/types';
import { createSyncedValueDescriptor, isSyncedValueDescriptor } from './ValueDescriptor/utils';

export function createSubscriptionWithSnapshot<T extends object>({
    subscribe,
    fetch,
    cache,
}: {
    subscribe: () => Observable<TValueDescriptor2<TSubscriptionEvent<T[]>>>;
    fetch: (platformTime: ISO | null) => Observable<TValueDescriptor2<T[]>>;
    cache: UnifierWithCompositeHash<T>;
}): Observable<TValueDescriptor2<T[]>> {
    const getData = () => getCachedArrayFromUnifier(cache);

    return subscribe().pipe(
        delayEmit((desc) => {
            if (isSyncedValueDescriptor(desc)) {
                return isSubscriptionEventSubscribed(desc.value)
                    ? EDelayEmitType.Pass
                    : EDelayEmitType.Delay;
            }

            return EDelayEmitType.PassThrough;
        }),
        concatMap((desc) =>
            isSyncedValueDescriptor(desc) && isSubscriptionEventSubscribed(desc.value)
                ? fetch(desc.value.payload.platformTime).pipe(
                      mapValueDescriptor(({ value }) => {
                          cache.clear();
                          return createSyncedValueDescriptor(createUpdateEvent<T[]>(value));
                      }),
                  )
                : of(desc),
        ),
        mapValueDescriptor(({ value }) => {
            if (!isSubscriptionEventSubscribed(value)) {
                cache.modify(value.payload as T[]);
            }

            return createSyncedValueDescriptor(getData());
        }),
        distinctValueDescriptorUntilChanged((a, b) => a === b),
    );
}
