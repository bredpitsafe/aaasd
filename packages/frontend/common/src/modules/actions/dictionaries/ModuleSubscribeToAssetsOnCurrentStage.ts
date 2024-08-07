import { isNil } from 'lodash-es';
import { EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type { TContextRef } from '../../../di';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '../../../utils/observable/memo.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleFetchAssets } from './ModuleFetchAssets.ts';

export const ModuleSubscribeToAssetsOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const getAssets = ModuleFetchAssets(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (_, options) => {
            return currentSocketUrl$.pipe(
                switchMap((target) => (isNil(target) ? EMPTY : getAssets({ target }, options))),
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
