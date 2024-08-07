import type { Nil } from '@common/types';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import { ModuleSubscribeToCurrentComponentsSnapshot } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToCurrentComponentsSnapshot.ts';
import type { TServer } from '@frontend/common/src/types/domain/servers.ts';
import { Fail } from '@frontend/common/src/types/Fail.ts';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '@frontend/common/src/utils/observable/memo.ts';
import {
    mapValueDescriptor,
    squashValueDescriptors,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { getTradingServersManagerParams } from '../../utils/router.ts';
import { ModuleTradingServersManagerRouter } from '../router/module.ts';

export const ModuleSubscribeCurrentServer = createObservableProcedure(
    (ctx) => {
        const { state$ } = ModuleTradingServersManagerRouter(ctx);
        const subscribe = ModuleSubscribeToCurrentComponentsSnapshot(ctx);

        return (_, options) => {
            return combineLatest([
                state$.pipe(
                    map((state) => {
                        return isNil(state.route.params)
                            ? null
                            : getTradingServersManagerParams(state.route.params);
                    }),
                    filter((value): value is Exclude<typeof value, Nil> => !isNil(value)),
                    map(createSyncedValueDescriptor),
                ),
                subscribe(undefined, options),
            ]).pipe(
                squashValueDescriptors(),
                mapValueDescriptor(
                    ({ value: [params, components] }): TValueDescriptor2<TServer> => {
                        if (components.servers.length === 0) {
                            return createUnsyncedValueDescriptor(
                                Fail(EGrpcErrorCode.NOT_FOUND, {
                                    message: `Cannot find any server`,
                                }),
                            );
                        }
                        const server = components.servers.find(
                            (server) => server.id === params.server,
                        );

                        if (isNil(server)) {
                            return createUnsyncedValueDescriptor(
                                Fail(EGrpcErrorCode.NOT_FOUND, {
                                    message: `Cannot find server with id ${params.server}`,
                                }),
                            );
                        }

                        return createSyncedValueDescriptor(server);
                    },
                ),
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
