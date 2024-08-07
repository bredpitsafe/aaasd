import { filter, switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '../../../utils/observable/memo.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleSubscribeToVirtualAccountsSnapshots } from './ModuleSubscribeToVirtualAccountsSnapshots.ts';

export const ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage = createObservableProcedure(
    (ctx) => {
        const subscribe = ModuleSubscribeToVirtualAccountsSnapshots(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (_: undefined, options) => {
            return currentSocketUrl$.pipe(
                filter((target): target is TSocketURL => target !== undefined),
                switchMap((target) => subscribe({ target }, options)),
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
