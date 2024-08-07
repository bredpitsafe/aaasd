import type { TStructurallyCloneable } from '@common/types';
import { assert, assertNever } from '@common/utils';
import { isNil } from 'lodash-es';
import type { Subscription } from 'rxjs';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, filter, finalize, map, takeUntil, tap } from 'rxjs/operators';

import { generateCorrelationId } from '../../../modules/communicationHandlers/utils.ts';
import { Binding } from '../../Tracing/Children/Binding.ts';
import type { Envelope, ErrorEnvelope, FinalizeEnvelope, PayloadEnvelope } from '../def.ts';
import { createActorEnvelopeBox } from '../index.ts';
import { loggerWebactor } from '../logger.ts';
import type { TActorObservableBox } from './def.ts';

type TCreateActorObservableBoxOptions = {
    useLogger?: boolean;
    timeout?: number;
};

//TODO: Box deduplication was located somewhere in the `webactor` library.
// Temporarily implement it here.
const boxMap = new Map<string, TActorObservableBox<string, any, any>>();

export const createActorObservableBox =
    <Request extends TStructurallyCloneable, Response extends TStructurallyCloneable>(
        options?: TCreateActorObservableBoxOptions,
    ) =>
    <Type extends string>(requestType: Type): TActorObservableBox<Type, Request, Response> => {
        if (boxMap.has(requestType)) {
            return boxMap.get(requestType) as TActorObservableBox<Type, Request, Response>;
        }

        let responseStreamRegistered = false;
        const destroy$ = new Subject<void>();
        const responseType = `RESPONSE_${requestType}` as const;
        const logger =
            options?.useLogger === false
                ? undefined
                : loggerWebactor.child([new Binding('Box'), new Binding(requestType)]);
        logger?.debug(`create`, options);

        const requestEnvBox = createActorEnvelopeBox<Envelope<Request>>({ useLogger: false })(
            requestType,
        );
        const responseEnvBox = createActorEnvelopeBox<Envelope<Response>>({ useLogger: false })(
            responseType,
        );

        const requestsMap = new Map<number, Subscription>();

        const requestStream = (actor: unknown, body: Request): Observable<Response> => {
            return new Observable((subscriber) => {
                assert(responseStreamRegistered, 'responseStream is not yet registered');

                const correlationId = generateCorrelationId();
                logger?.debug(`start request`, correlationId, body);
                const subscription = responseEnvBox
                    .as$(actor)
                    .pipe(
                        map(({ payload }) => payload),
                        filter((payload) => payload.correlationId === correlationId),
                        tap((envelope) => {
                            if (isPayloadEnvelope(envelope)) {
                                subscriber.next(envelope.payload);
                                return;
                            }
                            if (isFinalizeEnvelope(envelope)) {
                                subscriber.complete();
                                return;
                            }
                            if (isErrorEnvelope(envelope)) {
                                subscriber.error(envelope.error);
                                return;
                            }
                            assertNever(envelope);
                        }),
                        takeUntil(destroy$),
                        finalize(() => {
                            requestEnvBox.send(actor, { correlationId, finalize: true });
                            subscriber.complete();
                        }),
                        catchError((err, caught) => {
                            requestEnvBox.send(actor, { correlationId, error: err });
                            subscriber.error(err);
                            return caught;
                        }),
                    )
                    .subscribe();

                requestEnvBox.send(actor, { correlationId, payload: body });

                return () => {
                    subscription.unsubscribe();
                };
            });
        };

        const responseStream = (actor: unknown, obs$: (p: Request) => Observable<Response>) => {
            assert(
                !responseStreamRegistered,
                `responseStream is already registered for box type '${requestType}'`,
            );

            const subscription = requestEnvBox
                .as$(actor)
                .pipe(
                    tap(({ payload }) => {
                        const { correlationId } = payload;
                        const subscription = requestsMap.get(correlationId);

                        // Request initializer. Start the observable and put the subscription into the map.
                        if (isPayloadEnvelope(payload)) {
                            assert(
                                isNil(subscription),
                                'duplicate correlationId for the existing request',
                            );

                            logger?.debug(`send`, correlationId, payload);
                            requestsMap.set(
                                correlationId,
                                obs$(payload.payload)
                                    .pipe(
                                        tap((response) => {
                                            responseEnvBox.send(actor, {
                                                correlationId,
                                                payload: response,
                                            });
                                        }),
                                        catchError((err) => {
                                            responseEnvBox.send(actor, {
                                                correlationId,
                                                error: err,
                                            });
                                            return EMPTY;
                                        }),
                                        finalize(() => {
                                            responseEnvBox.send(actor, {
                                                correlationId,
                                                finalize: true,
                                            });
                                            requestsMap.delete(correlationId);
                                        }),
                                        takeUntil(destroy$),
                                    )
                                    .subscribe(),
                            );
                            return;
                        }

                        // Request is finalized by the caller (request observable is terminated).
                        // Finalize responseStream observable (it must be present in the map).
                        if (isFinalizeEnvelope(payload) || isErrorEnvelope(payload)) {
                            assert(!isNil(subscription), 'subscription not found');
                            subscription.unsubscribe();
                            return;
                        }

                        assertNever(payload);
                    }),
                )
                .subscribe();
            responseStreamRegistered = true;

            return () => {
                subscription.unsubscribe();
                responseStreamRegistered = false;
            };
        };

        const destroy = () => {
            destroy$.next();
            destroy$.complete();
            boxMap.delete(requestType);
            requestsMap.clear();
        };

        const box = { requestStream, responseStream, requestType, responseType, destroy };
        boxMap.set(requestType, box);
        return box;
    };

function isPayloadEnvelope<P>(envelope: Envelope<P>): envelope is PayloadEnvelope<P> {
    return 'payload' in envelope;
}

function isFinalizeEnvelope<P>(envelope: Envelope<P>): envelope is FinalizeEnvelope {
    return 'finalize' in envelope;
}

function isErrorEnvelope<P>(envelope: Envelope<P>): envelope is ErrorEnvelope {
    return 'error' in envelope;
}
