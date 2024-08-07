import type { ISO } from '@common/types';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../../defs/observables.ts';
import type { TComponentId } from '../../../../types/domain/component.ts';
import type { TComponentStateRevision } from '../../../../types/domain/ComponentStateRevision.ts';
import type { TWithSocketTarget } from '../../../../types/domain/sockets.ts';
import { getSocketUrlHash } from '../../../../utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '../../../../utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '../../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../../utils/semanticHash.ts';
import { createSyncedValueDescriptor } from '../../../../utils/ValueDescriptor/utils.ts';
import { ModuleFetchComponentStateRevisionsHistory } from './ModuleFetchComponentStateRevisionsHistory.ts';

export type TGetComponentStateRevisionProps = TWithSocketTarget & {
    componentId: TComponentId;
    platformTime: ISO;
};
export type TGetComponentStateRevisionReturnType = null | TComponentStateRevision;

export const ModuleFetchComponentStateRevision = createObservableProcedure(
    (ctx) => {
        const fetch = ModuleFetchComponentStateRevisionsHistory(ctx);

        return (params: TGetComponentStateRevisionProps, options) => {
            return fetch(
                {
                    target: params.target,
                    componentId: params.componentId,
                    params: {
                        platformTime: params.platformTime,
                        limit: 1,
                    },
                },
                options,
            ).pipe(
                mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.at(0) ?? null)),
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
