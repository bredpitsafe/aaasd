import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import { ModuleSubscribeToComponentsSnapshot } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToComponentsSnapshot.ts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '@frontend/common/src/utils/observable/memo.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import {
    createSyncedValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const ModuleSubscribeToCurrentServerList = createObservableProcedure(
    (ctx) => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const subscribe = ModuleSubscribeToComponentsSnapshot(ctx);

        return (_, options) => {
            return currentSocketUrl$.pipe(
                switchMap((url) => {
                    return isNil(url) ? of(WAITING_VD) : subscribe({ target: url }, options);
                }),
                mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.servers)),
            );
        };
    },
    {
        dedobs: {
            normalize: constantNormalizer,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
