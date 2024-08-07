import type { TRemoteProcedureDescriptor } from '@common/rpc';
import type { Observable } from 'rxjs';

import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import type { TWithTraceId } from '../../modules/actions/def.ts';
import { ModuleActor } from '../../modules/actor';
import { createActorObservableBox } from '../Actors/observable';
import { logErrorAndFail } from '../Rx/log';
import { logger as globalLogger } from '../Tracing';
import { Binding } from '../Tracing/Children/Binding';
import type { ExtractParams, ExtractReceive, ExtractTransportParams } from './types';

export const ModuleRegisterActorRemoteProcedure = ModuleFactory((ctx: TContextRef) => {
    const actor = ModuleActor(ctx);

    return function createRegisterActorRemoteProcedure<
        D extends TRemoteProcedureDescriptor<any, any, any>,
    >(
        descriptor: D,
        procedure: (
            params: ExtractParams<D>,
            options: TWithTraceId,
        ) => Observable<ExtractReceive<D>>,
        settings?: {
            logger: typeof globalLogger;
        },
    ) {
        const logger =
            settings?.logger ??
            globalLogger.child([new Binding(`RegisterRPC`), new Binding(descriptor.name)]);

        logger.debug('register', descriptor);
        return createActorObservableBox<ExtractTransportParams<D>, ExtractReceive<D>>()(
            descriptor.name,
        ).responseStream(actor, ({ params, options }) => {
            logger.trace(`Call`, descriptor, params, options);

            return procedure(params, options).pipe(logErrorAndFail(logger.error));
        });
    };
});
