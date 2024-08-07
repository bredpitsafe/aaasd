import { isNil } from 'lodash-es';
import { filter, switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '../../../utils/observable/memo.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleFetchGateKinds } from './ModuleFetchGateKinds.ts';

export const ModuleFetchGateKindsOnCurrentStage = createObservableProcedure(
    (ctx) => {
        const fetchGateKinds = ModuleFetchGateKinds(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (_: undefined, options) => {
            return currentSocketUrl$.pipe(
                filter((target): target is TSocketURL => !isNil(target)),
                switchMap((target) => {
                    return fetchGateKinds({ target }, options);
                }),
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
