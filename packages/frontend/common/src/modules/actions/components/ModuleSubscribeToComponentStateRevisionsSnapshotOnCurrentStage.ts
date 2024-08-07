import { isNil } from 'lodash-es';
import { filter, switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type { TComponentId } from '../../../types/domain/component.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { ModuleSocketPage } from '../../socketPage';
import { ModuleSubscribeToComponentStateRevisionsSnapshot } from './ModuleSubscribeToComponentStateRevisionsSnapshot.ts';

type TProps = {
    componentId: TComponentId;
    btRunNo?: number;
};

export const ModuleSubscribeToComponentStateRevisionsSnapshotOnCurrentStage =
    createObservableProcedure(
        (ctx) => {
            const subscribe = ModuleSubscribeToComponentStateRevisionsSnapshot(ctx);
            const { currentSocketUrl$ } = ModuleSocketPage(ctx);

            return (props: TProps, options) => {
                return currentSocketUrl$.pipe(
                    filter((target): target is TSocketURL => !isNil(target)),
                    switchMap((target) => {
                        return subscribe({ ...props, target }, options);
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
