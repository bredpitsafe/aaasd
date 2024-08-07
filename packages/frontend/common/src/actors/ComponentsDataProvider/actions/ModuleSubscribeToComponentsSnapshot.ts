import type { TGate } from '@frontend/common/src/types/domain/gates';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TServer } from '@frontend/common/src/types/domain/servers';
import type { TSocketStruct, TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import {
    extractValueDescriptorFromError,
    mapValueDescriptor,
    scanValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { UnifierWithCompositeHash } from '@frontend/common/src/utils/unifierWithCompositeHash';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import type { Observable } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { ModuleSubscribeToComponentUpdates } from './ModuleSubscribeToComponentUpdates.ts';

export const ModuleSubscribeToComponentsSnapshot = createObservableProcedure(
    (ctx) => {
        const subscribeToComponentUpdates = ModuleSubscribeToComponentUpdates(ctx);

        return (
            params: { target: TSocketURL | TSocketStruct },
            options,
        ): Observable<
            TValueDescriptor2<{
                servers: TServer[];
                robots: TRobot[];
                gates: TGate[];
                componentRemovalEnabled: boolean;
            }>
        > => {
            return subscribeToComponentUpdates(params, options).pipe(
                scanValueDescriptor(
                    (
                        acc:
                            | undefined
                            | TValueDescriptor2<{
                                  servers: UnifierWithCompositeHash<TServer>;
                                  robots: UnifierWithCompositeHash<TRobot>;
                                  gates: UnifierWithCompositeHash<TGate>;
                                  componentRemovalEnabled: boolean;
                              }>,
                        { value },
                    ) => {
                        const payload = acc?.value ?? {
                            servers: new UnifierWithCompositeHash<TServer>('id'),
                            robots: new UnifierWithCompositeHash<TRobot>('id'),
                            gates: new UnifierWithCompositeHash<TGate>('id'),
                            componentRemovalEnabled: false,
                        };

                        payload.servers.modify(value.servers);
                        payload.robots.modify(value.robots);
                        payload.gates.modify(value.gates);
                        payload.componentRemovalEnabled = value.componentRemovalEnabled;

                        return createSyncedValueDescriptor(payload);
                    },
                ),
                mapValueDescriptor(({ value }) => {
                    return createSyncedValueDescriptor({
                        servers: UnifierWithCompositeHash.getCachedArray(value.servers),
                        robots: UnifierWithCompositeHash.getCachedArray(value.robots),
                        gates: UnifierWithCompositeHash.getCachedArray(value.gates),
                        componentRemovalEnabled: value.componentRemovalEnabled,
                    });
                }),
                extractValueDescriptorFromError(),
                progressiveRetry(),
            );
        };
    },
    {
        dedobs: {
            normalize: ([params]) =>
                semanticHash.get(params, {
                    target: semanticHash.withHasher(getSocketUrlHash),
                }),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
