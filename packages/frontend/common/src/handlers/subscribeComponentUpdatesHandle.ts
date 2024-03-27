import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TReceivedData } from '../lib/BFFSocket/def';
import type { TStreamHandler } from '../modules/communicationHandlers/def';
import { EComponentType } from '../types/domain/component';
import type { TGate } from '../types/domain/gates';
import type { TRobot } from '../types/domain/robots';
import type { TServer } from '../types/domain/servers';
import type { TSocketURL } from '../types/domain/sockets';
import { logger } from '../utils/Tracing';
import type { THandlerStreamOptions, TRequestStreamOptions, TSubscribed } from './def';
import {
    filterOutSubscribedMessage,
    getTraceId,
    pollIntervalForRequest,
    serverGateToGate,
} from './utils';

type TSendBody = TRequestStreamOptions & {
    type: 'SubscribeComponentUpdates' | 'Unsubscribe';
};

type TReceiveBody = {
    type: 'ComponentUpdate';
    instances: TServer[];
    mdGates: Omit<TGate, 'type'>[];
    execGates: Omit<TGate, 'type'>[];
    robots: TRobot[];
    componentRemovalEnabled: boolean;
};

export type TComponentUpdatePayload = {
    servers: TServer[];
    gates: TGate[];
    robots: TRobot[];
    componentRemovalEnabled: boolean;
};

/**
 * @deprecated
 */
export function subscribeComponentUpdatesHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    options?: THandlerStreamOptions,
): Observable<TReceivedData<TComponentUpdatePayload>> {
    const traceId = getTraceId(options);

    logger.trace(`[subscribeComponentUpdatesHandle]: init`, { traceId });

    return handler<TSendBody, TReceiveBody | TSubscribed>(
        url,
        () => {
            return [
                {
                    type: 'SubscribeComponentUpdates',
                    pollInterval: pollIntervalForRequest(options?.pollInterval),
                },
                { type: 'Unsubscribe' },
            ];
        },
        { ...options, traceId },
    ).pipe(
        filterOutSubscribedMessage<TReceiveBody>(),
        map((envelope: TReceivedData<TReceiveBody>) => {
            const { instances, robots, mdGates, execGates, componentRemovalEnabled } =
                envelope.payload;

            return {
                ...envelope,
                payload: {
                    servers: instances,
                    robots: robots,
                    gates: [
                        ...(mdGates || []).map((gate) =>
                            serverGateToGate(gate, EComponentType.mdGate),
                        ),
                        ...(execGates || []).map((gate) =>
                            serverGateToGate(gate, EComponentType.execGate),
                        ),
                    ],
                    componentRemovalEnabled,
                },
            };
        }),
    );
}
