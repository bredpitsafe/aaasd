import { isSubscriptionEventSubscribed } from '@common/rx';
import { isNil } from 'lodash-es';
import { filter, switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type { TComponentId } from '../../../types/domain/component.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { createSyncedValueDescriptor, RECEIVING_VD } from '../../../utils/ValueDescriptor/utils.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleSubscribeToComponentConfigUpdates } from './ModuleSubscribeToComponentConfigUpdates.ts';

export const ModuleSubscribeToComponentConfigSnapshotOnCurrentStage = createObservableProcedure(
    (ctx) => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const subscribe = ModuleSubscribeToComponentConfigUpdates(ctx);

        return (
            params: {
                componentId: TComponentId;
                lastDigest: string | null;
            },
            options,
        ) => {
            return currentSocketUrl$.pipe(
                filter((target): target is TSocketURL => !isNil(target)),
                switchMap((target) => subscribe({ ...params, target }, options)),
                mapValueDescriptor((vd) => {
                    if (isSubscriptionEventSubscribed(vd.value)) {
                        return RECEIVING_VD;
                    }

                    return createSyncedValueDescriptor(vd.value.payload);
                }),
            );
        };
    },
    {
        dedobs: {
            normalize: ([params]) => semanticHash.get(params, {}),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
