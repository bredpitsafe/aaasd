import { getNowISO } from '@common/utils';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../../defs/observables.ts';
import type { TComponentId } from '../../../../types/domain/component.ts';
import type { TComponentStateRevision } from '../../../../types/domain/ComponentStateRevision.ts';
import type { TWithSocketTarget } from '../../../../types/domain/sockets.ts';
import { createSubscriptionWithSnapshot } from '../../../../utils/createSubscriptionWithSnapshot.ts';
import { getSocketUrlHash } from '../../../../utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '../../../../utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '../../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../../utils/semanticHash.ts';
import { UnifierWithCompositeHash } from '../../../../utils/unifierWithCompositeHash.ts';
import { createSyncedValueDescriptor } from '../../../../utils/ValueDescriptor/utils.ts';
import { ModuleFetchComponentStateRevisionsHistory } from './ModuleFetchComponentStateRevisionsHistory.ts';
import { ModuleSubscribeToComponentStateRevisions } from './ModuleSubscribeToComponentStateRevisions.ts';

export const ModuleSubscribeToComponentStateRevisionsSnapshot = createObservableProcedure(
    (ctx) => {
        const cache = new UnifierWithCompositeHash<TComponentStateRevision>('platformTime');
        const fetch = ModuleFetchComponentStateRevisionsHistory(ctx);
        const subscribe = ModuleSubscribeToComponentStateRevisions(ctx);

        return (
            props: TWithSocketTarget & {
                componentId: TComponentId;
                btRunNo?: number;
            },
            options,
        ) => {
            return createSubscriptionWithSnapshot({
                cache,
                fetch: (platformTime) =>
                    fetch(
                        { ...props, params: { platformTime: platformTime ?? getNowISO() } },
                        options,
                    ),
                subscribe: () => subscribe(props, options),
            }).pipe(
                mapValueDescriptor(({ value }) => {
                    return createSyncedValueDescriptor(
                        value.sort((a, b) => (a.platformTime > b.platformTime ? -1 : 1)),
                    );
                }),
            );
        };
    },
    {
        dedobs: {
            normalize: ([props]) =>
                semanticHash.get(props, { target: semanticHash.withHasher(getSocketUrlHash) }),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
