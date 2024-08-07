import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import type { Actor, ActorContext } from '../../actors/def.ts';
import { Binding } from '../Tracing/Children/Binding.ts';
import type { TActorEnvelopeBox } from './def';
import { loggerWebactor } from './logger.ts';

type ActorConstructor<In, Out> = (context: ActorContext<In, Out>) => unknown | Function;

// TODO: This is a hack that connects all actors with a common context.
// This is a prerequisite to purging actors system from the UI & moving completely to modules.
const ctx: ActorContext = {};

export const createActor = <In, Out>(name: string, constructor: ActorConstructor<In, Out>) => {
    const logger = loggerWebactor.child(new Binding(name));

    loggerWebactor.trace(`start ${name}`);

    const actor: Actor = {
        name,
        launch: () => {
            logger.info('launch');

            // This is actually the only required line here.
            // Everything else is a backwards compatibility layer
            constructor(ctx);
            return actor;
        },
        destroy: () => {
            logger.info('destroy');
        },
    };

    return actor;
};

type TCreateActorEnvelopeBoxOptions = {
    useLogger?: boolean;
};

export const createActorEnvelopeBox =
    <P>(options?: TCreateActorEnvelopeBoxOptions) =>
    <T extends string>(type: T): TActorEnvelopeBox<T, P> => {
        const logger =
            options?.useLogger === false
                ? undefined
                : loggerWebactor.child([new Binding('EnvelopeBox'), new Binding(type)]);

        logger?.debug(`createActorEnvelopeBox`, options);
        const subject = new Subject<P>();

        const as$: TActorEnvelopeBox<T, P>['as$'] = () => {
            return subject.pipe(map((payload) => ({ payload })));
        };

        const send: TActorEnvelopeBox<T, P>['send'] = (_, payload) => {
            logger?.debug(`send`, payload);
            subject.next(payload);
        };

        return {
            type,
            as$,
            send,
        };
    };
