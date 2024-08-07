import { isSubscriptionEventSubscribed } from '@common/rx';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type { TVirtualAccount } from '../../../types/domain/account.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor, scanValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { UnifierWithCompositeHash } from '../../../utils/unifierWithCompositeHash.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import { ModuleSubscribeToVirtualAccountsUpdates } from './ModuleSubscribeToVirtualAccountsUpdates.ts';

export const ModuleSubscribeToVirtualAccountsSnapshots = createObservableProcedure(
    (ctx) => {
        const subscribe = ModuleSubscribeToVirtualAccountsUpdates(ctx);

        return (params: TWithSocketTarget, options) => {
            return subscribe(params, options).pipe(
                scanValueDescriptor(
                    (
                        acc:
                            | undefined
                            | TValueDescriptor2<UnifierWithCompositeHash<TVirtualAccount>>,
                        { value },
                    ) => {
                        const cache =
                            acc?.value ?? new UnifierWithCompositeHash<TVirtualAccount>(['id']);

                        if (isSubscriptionEventSubscribed(value)) {
                            cache.clear();
                        } else {
                            cache.modify(value.payload);
                        }

                        return createSyncedValueDescriptor(cache);
                    },
                ),
                mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.toArray())),
            );
        };
    },
    {
        dedobs: {
            normalize: ([params]) =>
                semanticHash.get(params, { target: semanticHash.withHasher(getSocketUrlHash) }),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
