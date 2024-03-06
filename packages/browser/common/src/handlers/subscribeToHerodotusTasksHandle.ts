import { type Observable, catchError, map, of, startWith } from 'rxjs';

import { EHerodotusTaskStatus, THerodotusTask } from '../../../herodotus/src/types/domain';
import { THandlerOptions, TStreamHandler } from '../modules/communicationHandlers/def';
import { TRobotId } from '../types/domain/robots';
import { TSocketURL } from '../types/domain/sockets';
import { FailFactory } from '../types/Fail';
import {
    createSubscribedEvent,
    createUpdateEvent,
    TSubscriptionEvent,
} from '../utils/Rx/subscriptionEvents';
import { logger } from '../utils/Tracing';
import { ExtractValueDescriptor, ValueDescriptorFactory } from '../utils/ValueDescriptor';
import { TSubscribed, TUnsubscribe } from './def';

type TParams = {
    filters: {
        robotId: TRobotId;
        statuses?: Array<EHerodotusTaskStatus>;
    };
};
type TSendBody =
    | {
          type: 'SubscribeToHerodotusTasks';
          robotId: TRobotId;
          pollInterval?: number;
      }
    | TUnsubscribe;

type TUpdateBody = {
    type: 'HerodotusTaskUpdates';
    updates: Array<THerodotusTask>;
};

type TReceiveBody = TSubscribed | TUpdateBody;
const HerodotusTasksSubscriptionFail = FailFactory('subscribeToHerodotusTasksHandle');
const UNKNOWN_FAIL = HerodotusTasksSubscriptionFail('UNKNOWN');
const HerodotusTasksSubscription = ValueDescriptorFactory<
    TSubscriptionEvent<Array<THerodotusTask>>,
    typeof UNKNOWN_FAIL
>();
type TResult = ExtractValueDescriptor<typeof HerodotusTasksSubscription>;

export function subscribeToHerodotusTasksHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    params: TParams,
    options: THandlerOptions,
): Observable<TResult> {
    logger.trace('[subscribeToHerodotusTasksHandle]', {
        url,
        params,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        () => [
            {
                type: 'SubscribeToHerodotusTasks',
                robotId: params.filters.robotId,
            },
            {
                type: 'Unsubscribe',
            },
        ],
        options,
    ).pipe(
        map((envelop) => {
            if (envelop.payload.type === 'Subscribed') {
                return HerodotusTasksSubscription.sync(
                    createSubscribedEvent({
                        platformTime: envelop.payload.platformTime,
                        index: 0,
                    }),
                    null,
                );
            }

            return HerodotusTasksSubscription.sync(
                createUpdateEvent(envelop.payload.updates),
                null,
            );
        }),
        catchError((err) => {
            logger.error('[subscribeToHerodotusTasksHandle]', {
                url,
                params,
                options,
                error: err,
            });
            return of(HerodotusTasksSubscription.fail(UNKNOWN_FAIL));
        }),
        startWith(HerodotusTasksSubscription.unsc(null) as TResult),
    );
}
