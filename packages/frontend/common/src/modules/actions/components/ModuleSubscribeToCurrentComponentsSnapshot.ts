import { isNil } from 'lodash-es';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '../../../utils/observable/memo.ts';
import { WAITING_VD } from '../../../utils/ValueDescriptor/utils.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleSubscribeToComponentsSnapshot } from './ModuleSubscribeToComponentsSnapshot.ts';

export const ModuleSubscribeToCurrentComponentsSnapshot = createObservableProcedure(
    (ctx) => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const subscribe = ModuleSubscribeToComponentsSnapshot(ctx);

        return (_, options) => {
            return currentSocketUrl$.pipe(
                switchMap((url) => {
                    return isNil(url) ? of(WAITING_VD) : subscribe({ target: url }, options);
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
