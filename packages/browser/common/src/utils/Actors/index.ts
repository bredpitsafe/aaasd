import './internalProviders';

import { Observable, TeardownLogic } from 'rxjs';
import {
    Actor,
    AnyEnvelope,
    connectActorToActor,
    createActorFactory,
    createEnvelope,
    createSubscribe,
    dispatch,
    Envelope,
    ExtractEnvelope,
} from 'webactor';

import { generateTraceId } from '../traceId';
import { logger } from '../Tracing';
import { TActorEnvelopeBox } from './def';
import { createMailbox } from './mailbox';

const createActorBase = createActorFactory({ getMailbox: createMailbox });

export const createActor: typeof createActorBase = (name, constructor) => {
    const uniqueName = `${name}(${generateTraceId()})`;

    logger.trace(`[Webactor] start ${uniqueName}`);

    return createActorBase(uniqueName, constructor);
};

export const lazifyActor = <In extends AnyEnvelope, Out extends AnyEnvelope>(
    trigger: (envelope: AnyEnvelope) => boolean,
    constructor: () => Promise<Actor<In, Out>>,
) => {
    const uniqueName = `LazifyActor(${generateTraceId()})`;
    const wrapper = createActorBase(uniqueName, (context) => {
        let actor: undefined | Promise<Actor<In, Out>>;
        let disconnect: undefined | Function;
        const unsubscribe = context.subscribe(async (envelope) => {
            if (trigger(envelope)) {
                unsubscribe();
                (actor = constructor()).then((actor) => {
                    disconnect = connectActorToActor(context, actor as any);
                    actor.launch();
                    wrapper.dispatch(envelope);
                });
            }
        });

        return () => {
            unsubscribe();
            actor?.then((actor) => {
                disconnect?.();
                actor.destroy();
            });
        };
    });

    return wrapper;
};

export const createActorEnvelopeBox =
    <P>() =>
    <T extends string>(type: T): TActorEnvelopeBox<T, P> => {
        const is: TActorEnvelopeBox<T, P>['is'] = (env): env is Envelope<T, P> => env.type === type;

        const as$: TActorEnvelopeBox<T, P>['as$'] = (source) => {
            const subscribe = createSubscribe<Envelope<T, P>>(source);
            return new Observable<Envelope<T, P>>((subscriber) => {
                return <TeardownLogic>(
                    subscribe((envelope) => is(envelope) && subscriber.next(envelope))
                );
            });
        };

        const send: TActorEnvelopeBox<T, P>['send'] = (source, payload, transferable) =>
            dispatch(source, create(payload, transferable) as ExtractEnvelope<typeof source>);

        const create: TActorEnvelopeBox<T, P>['create'] = (payload, transferable) =>
            createEnvelope(type, payload, transferable);

        return {
            type,
            is,
            as$,
            send,
            create,
        };
    };

export function getActorEnvelopeBoxType(actorName: string, commandName: string): string {
    return `${actorName}_${commandName}`;
}
