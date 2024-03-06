import { Observable } from 'rxjs';

import { ModuleFactory, TContextRef } from '../../di';
import { TWithTraceId } from '../../handlers/def';
import { ModuleActor } from '../../modules/actor';
import { createActorObservableBox } from '../Actors/observable';
import { createActorRequestBox } from '../Actors/request';
import { logErrorAndFail } from '../Rx/log';
import { logger as globalLogger } from '../Tracing';
import { Binding } from '../Tracing/Children/Binding';
import { ERemoteProcedureType } from './defs';
import {
    ExtractParams,
    ExtractReceive,
    ExtractTransportParams,
    TRemoteProcedureDescriptor,
} from './types';

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
            globalLogger.child(new Binding(`[RemoteProcedure:${descriptor.name}]`));
        const response =
            descriptor.type === ERemoteProcedureType.Subscribe
                ? createActorObservableBox<ExtractTransportParams<D>, ExtractReceive<D>>()(
                      descriptor.name,
                  ).responseStream
                : createActorRequestBox<ExtractTransportParams<D>, ExtractReceive<D>>()(
                      descriptor.name,
                  ).response;

        logger.trace(`Init`, descriptor);

        return response(actor, ({ params, options }) =>
            procedure(params, options).pipe(logErrorAndFail(logger.error)),
        );
    };
});
