import { isNil, isUndefined } from 'lodash-es';
import { EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type { TContextRef } from '../../../di';
import type { EInstrumentStatus } from '../../../types/domain/instrument';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { semanticHash } from '../../../utils/semanticHash';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleFetchInstruments } from './ModuleFetchInstruments.ts';

export const ModuleSubscribeToInstrumentsOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const getAssets = ModuleFetchInstruments(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (
            filters:
                | undefined
                | {
                      statuses?: EInstrumentStatus[];
                      nameRegexes?: string[];
                  },
            options,
        ) => {
            return currentSocketUrl$.pipe(
                switchMap((target) =>
                    isNil(target) ? EMPTY : getAssets({ target, filters }, options),
                ),
            );
        };
    },
    {
        dedobs: {
            normalize: ([filters]) => {
                return isUndefined(filters)
                    ? 0
                    : semanticHash.get(filters, {
                          statuses: semanticHash.withSorter(null),
                          nameRegexes: semanticHash.withSorter(null),
                      });
            },
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
