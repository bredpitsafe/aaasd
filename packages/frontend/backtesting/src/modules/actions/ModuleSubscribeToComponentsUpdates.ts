import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleSubscribeToComponentUpdates } from '@frontend/common/src/modules/actions/ModuleSubscribeToComponentUpdates';
import type { TGate } from '@frontend/common/src/types/domain/gates';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TServer } from '@frontend/common/src/types/domain/servers';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import {
    extractValueDescriptorFromError,
    mapValueDescriptor,
    scanValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { UnifierWithCompositeHash } from '@frontend/common/src/utils/unifierWithCompositeHash';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { Observable } from 'rxjs';

export const ModuleSubscribeToComponentsUpdates = ModuleFactory((ctx) => {
    const subscribeToComponentUpdates = ModuleSubscribeToComponentUpdates(ctx);

    return dedobs(
        (
            target: TSocketURL,
            traceId: TraceId,
        ): Observable<
            TValueDescriptor2<{ servers: TServer[]; robots: TRobot[]; gates: TGate[] }>
        > => {
            return subscribeToComponentUpdates({ target }, { traceId }).pipe(
                scanValueDescriptor(
                    (
                        acc:
                            | undefined
                            | TValueDescriptor2<{
                                  servers: UnifierWithCompositeHash<TServer>;
                                  robots: UnifierWithCompositeHash<TRobot>;
                                  gates: UnifierWithCompositeHash<TGate>;
                              }>,
                        { value },
                    ) => {
                        const payload = acc?.value ?? {
                            servers: new UnifierWithCompositeHash<TServer>('id'),
                            robots: new UnifierWithCompositeHash<TRobot>('id'),
                            gates: new UnifierWithCompositeHash<TGate>('id'),
                        };

                        payload.servers.modify(value.servers);
                        payload.robots.modify(value.robots);
                        payload.gates.modify(value.gates);

                        return createSyncedValueDescriptor(payload);
                    },
                ),
                mapValueDescriptor(({ value }) =>
                    createSyncedValueDescriptor({
                        servers: value.servers.toArray(),
                        robots: value.robots.toArray(),
                        gates: value.gates.toArray(),
                    }),
                ),
                extractValueDescriptorFromError(),
                progressiveRetry(),
            );
        },
        {
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});
