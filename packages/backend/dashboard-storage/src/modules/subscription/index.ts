import { generateTraceId } from '@backend/utils/src/traceId/index.ts';
import { tapOnce } from '@common/rx';
import { isEmpty, isNil } from 'lodash-es';
import { performance } from 'perf_hooks';
import {
    catchError,
    filter,
    finalize,
    first,
    map,
    merge,
    Observable,
    of,
    shareReplay,
    Subscription,
    throwError,
    timeout,
} from 'rxjs';

import {
    EActorName,
    TActorRequest,
    TActorSocketKey,
    TActorSubscriptionKey,
} from '../../def/actor.ts';
import { EMetricsLabels } from '../../def/metrics.ts';
import type { UnsubscribeRequest } from '../../def/request.ts';
import { Request } from '../../def/request.ts';
import type { ErrorResponse, UnsubscribeResponse } from '../../def/response.ts';
import { Response, ResponseState } from '../../def/response.ts';
import { createActorSubscriptionKey } from '../../utils/actors.ts';
import { config } from '../../utils/config.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { logger } from '../../utils/logger.ts';
import { metrics } from '../../utils/metrics.ts';
import { authenticateSocket, isAuthenticated$, logoutSocket } from '../authentication/index.ts';
import {
    createDashboard,
    deleteDashboard,
    fetchDashboardConfig,
    fetchDashboardDraft,
    fetchDashboardIdByLegacyId,
    importDashboard,
    renameDashboard,
    subscribeToDashboard,
    subscribeToDashboardsList,
    updateDashboard,
} from '../dashboards/index.ts';
import { resetDashboardDraft, updateDashboardDraft } from '../drafts/index.ts';
import { produceHeartbeat, receiveHeartbeat } from '../heartbeat/index.ts';
import {
    subscribeToDashboardPermissions,
    updateDashboardPermissions,
    updateDashboardShareSettings,
} from '../permissions/index.ts';
import { ping } from '../ping/index.ts';
import { TCloseParams, TSendParams } from '../socket/def.ts';
import { subscribeToUsers } from '../users/index.ts';

type TActorSubscriptionState = {
    subscription: Subscription;
    request: TActorRequest;
};

const subscriptionStateMap = new Map<TActorSubscriptionKey, TActorSubscriptionState>();
const subscriptionKeyMap = new Map<TActorSocketKey, Set<TActorSubscriptionKey>>();

export const runSubscription = (
    req: TActorRequest,
    send: (params: TSendParams) => void,
    close: (params: TCloseParams) => void,
): void => {
    const { socketKey, traceId, correlationId, payload } = req;
    const { type } = payload;
    const pathProcessor = requestMap[type];
    const { skipResponse = false, skipAuth = false, isSubscription = false } = pathProcessor;

    if (skipResponse) {
        return;
    }

    const subscriptionKey = createActorSubscriptionKey(socketKey, correlationId);

    logger.info({
        message: '`runSubscription` -  started',
        actor: EActorName.Subscription,
        traceId: req.traceId,
        correlationId: req.correlationId,
        type: req.payload.type,
    });

    const isAuthenticatedSocket$ = isAuthenticated$(socketKey).pipe(
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    metrics.subscriptions.total.inc({ [EMetricsLabels.Type]: type });
    const obs$ = pathProcessor.method(req);
    // Destroy subscription by throwing an error when socket is not authenticated anymore
    // The error will be handled by `subscriptionActor.runSubscription`
    const destroyer$ = isAuthenticatedSocket$.pipe(
        filter((isAuthenticated) => !(isAuthenticated || skipAuth)),
        map(() => {
            // Wait a second to send all corresponding errors to the socket, then close it
            setTimeout(
                () => close({ socketKey, traceId, correlationId }),
                config.authentication.socketDeauthCloseTimeout,
            );

            metrics.socket.notAuthenticatedErrors.inc();
            throw new ActorError({
                kind: EActorErrorKind.Authentication,
                title: 'AuthenticationRequired',
                description: 'Bearer token was not provided or has expired in the current socket',
            });
        }),
    );

    let subscription$ = merge(obs$, destroyer$);
    if (!isSubscription) {
        subscription$ = subscription$.pipe(first());
    }

    const startTime = performance.now();
    const response$: Observable<TSendParams> = subscription$.pipe(
        timeout({
            first: config.subscriptions.timeout,
            with: () =>
                throwError(
                    () =>
                        new ActorError({
                            kind: EActorErrorKind.Timeout,
                            title: 'Subscription timeout',
                            description: `Subscription failed to produce first value after ${config.subscriptions.timeout}ms`,
                        }),
                ),
        }),
        tapOnce(() => {
            const duration = performance.now() - startTime;
            metrics.subscriptions.firstResponseDuration.observe(
                { [EMetricsLabels.Type]: type },
                duration,
            );
        }),
        map((payload) => {
            return {
                socketKey,
                traceId,
                correlationId,
                state: isSubscription ? ResponseState.InProgress : ResponseState.Done,
                payload,
            };
        }),
        catchError((err) => {
            metrics.subscriptions.errors.inc({ [EMetricsLabels.Type]: type });
            const isActorError = err instanceof ActorError;
            const error: ErrorResponse = isActorError
                ? err.toErrorResponse()
                : {
                      kind: EActorErrorKind.Unspecified,
                      description: `Non-actor error: ${err.message as string}`,
                  };

            if (isActorError) {
                logger.error({
                    message: '`runSubscription` -  actor error was thrown from subscriber',
                    actor: EActorName.Subscription,
                    traceId: req.traceId,
                    correlationId: req.correlationId,
                    type: req.payload.type,
                    error,
                });

                metrics.subscriptions.actorErrors.inc({
                    [EMetricsLabels.Type]: type,
                    [EMetricsLabels.ErrorType]: error.kind,
                });
            } else {
                logger.error({
                    message: '`runSubscription` -  unspecified error was thrown from subscriber',
                    actor: EActorName.Subscription,
                    traceId: req.traceId,
                    correlationId: req.correlationId,
                    type: req.payload.type,
                    error: error.description,
                    errorStack: err.stack,
                });

                metrics.subscriptions.unspecifiedErrors.inc({
                    [EMetricsLabels.Type]: type,
                    [EMetricsLabels.Value]: err.message,
                });
            }

            return of({ socketKey, traceId, correlationId, state: ResponseState.Done, error });
        }),
        finalize(() => {
            logger.info({
                message: '`runSubscription` -  subscription completed',
                actor: EActorName.Subscription,
                traceId: req.traceId,
                correlationId: req.correlationId,
                type: req.payload.type,
            });
        }),
    );

    const subscription = response$.subscribe(send);

    if (isSubscription) {
        subscriptionStateMap.set(subscriptionKey, { subscription, request: req });
        metrics.subscriptions.active.inc({ [EMetricsLabels.Type]: type });
        const socketSubscriptionKeys =
            subscriptionKeyMap.get(socketKey) ?? new Set<TActorSubscriptionKey>();
        socketSubscriptionKeys.add(subscriptionKey);
        subscriptionKeyMap.set(socketKey, socketSubscriptionKeys);

        logger.info({
            message: '`runSubscription` -  added new subscription',
            actor: EActorName.Subscription,
            traceId: req.traceId,
            correlationId: req.correlationId,
            type: req.payload.type,
            activeSubscriptions: subscriptionStateMap.size,
            activeSubscriptionsInCurrentSocket: socketSubscriptionKeys.size,
            activeSocketsWithSubscriptions: subscriptionKeyMap.size,
        });
    }
};

const unsubscribe = (req: TActorRequest<UnsubscribeRequest>): Observable<UnsubscribeResponse> => {
    return new Observable<UnsubscribeResponse>((subscriber) => {
        const subscriptionKey = createActorSubscriptionKey(req.socketKey, req.correlationId);
        const subscriptionState = subscriptionStateMap.get(subscriptionKey);
        const socketSubscriptionKeys = subscriptionKeyMap.get(req.socketKey);

        if (!isNil(subscriptionState)) {
            const { subscription, request } = subscriptionState;
            subscription.unsubscribe();
            subscriptionStateMap.delete(subscriptionKey);
            metrics.subscriptions.active.dec({
                [EMetricsLabels.Type]: request.payload.type,
            });
            if (!isNil(socketSubscriptionKeys)) {
                socketSubscriptionKeys.delete(subscriptionKey);
                subscriptionKeyMap.set(req.socketKey, socketSubscriptionKeys);
            }
        }

        logger.info({
            message: '`unsubscribe` -  complete',
            actor: EActorName.Subscription,
            traceId: req.traceId,
            correlationId: req.correlationId,
            subscriptionKey,
            activeSubscriptions: subscriptionStateMap.size,
            activeSubscriptionsInCurrentSocket: socketSubscriptionKeys?.size ?? 0,
            activeSocketsWithSubscriptions: subscriptionKeyMap.size,
        });

        subscriber.next({ type: 'Unsubscribed' });
        subscriber.complete();
    });
};

export const unsubscribeSocket = (socketKey: TActorSocketKey) => {
    const subscriptions = subscriptionKeyMap.get(socketKey);
    if (isNil(subscriptions) || isEmpty(subscriptions)) {
        return;
    }

    subscriptions.forEach((subscriptionKey) => {
        const subscriptionState = subscriptionStateMap.get(subscriptionKey);

        if (!isNil(subscriptionState)) {
            const { subscription, request } = subscriptionState;
            subscription.unsubscribe();
            subscriptionStateMap.delete(subscriptionKey);
            metrics.subscriptions.active.dec({
                [EMetricsLabels.Type]: request.payload.type,
            });
        }
    });
    subscriptionKeyMap.delete(socketKey);

    logger.info({
        message: '`unsubscribeSocket` -  complete',
        actor: EActorName.Subscription,
        traceId: generateTraceId(),
        socketKey,
        activeSubscriptions: subscriptionStateMap.size,
        activeSubscriptionsInCurrentSocket: subscriptions.size,
        activeSocketsWithSubscriptions: subscriptionKeyMap.size,
    });
};

const requestMap: Record<
    Request['payload']['type'],
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        method: (_: TActorRequest<any>) => Observable<Response['payload']>;
        skipAuth?: boolean;
        skipResponse?: boolean;
        isSubscription?: boolean;
    }
> = {
    Ping: { method: ping, skipAuth: true },
    Heartbeat: { method: receiveHeartbeat, skipAuth: true, skipResponse: true },
    ServerHeartbeat: { method: produceHeartbeat, skipAuth: true, isSubscription: true },
    Authenticate: { method: authenticateSocket, skipAuth: true },
    Logout: { method: logoutSocket, skipAuth: true },
    Unsubscribe: { method: unsubscribe },
    CreateDashboard: { method: createDashboard },
    ImportDashboard: { method: importDashboard },
    UpdateDashboard: { method: updateDashboard },
    DeleteDashboard: { method: deleteDashboard },
    FetchDashboardConfig: { method: fetchDashboardConfig },
    FetchDashboardDraft: { method: fetchDashboardDraft },
    UpdateDashboardPermissions: { method: updateDashboardPermissions },
    UpdateDashboardShareSettings: { method: updateDashboardShareSettings },
    SubscribeToDashboard: { method: subscribeToDashboard, isSubscription: true },
    SubscribeToDashboardsList: { method: subscribeToDashboardsList, isSubscription: true },
    UpdateDashboardDraft: { method: updateDashboardDraft },
    ResetDashboardDraft: { method: resetDashboardDraft },
    SubscribeToUsers: { method: subscribeToUsers, isSubscription: true },
    SubscribeToDashboardPermissions: {
        method: subscribeToDashboardPermissions,
        isSubscription: true,
    },
    FetchDashboardIdByLegacyId: { method: fetchDashboardIdByLegacyId },
    RenameDashboard: { method: renameDashboard },
};
