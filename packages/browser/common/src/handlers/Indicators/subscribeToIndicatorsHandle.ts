import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TIndicator } from '../../modules/actions/indicators/defs';
import type { TStreamHandler } from '../../modules/communicationHandlers/def';
import { TBacktestingRunId } from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import { ISO } from '../../types/time';
import { toMilliseconds } from '../../utils/time';
import { logger } from '../../utils/Tracing';
import type {
    THandlerStreamOptions,
    TRequestStreamOptions,
    TSubscribed,
    TWithSnapshot,
} from '../def';
import { getTraceId, pollIntervalForRequest } from '../utils';
import { modifyIndicators } from './utils';

export type TSubscribeToIndicatorsProps = {
    names?: string[];
    nameRegexes?: string[];
    btRuns?: Array<TBacktestingRunId>;
    minUpdateTime?: ISO;
};

type TSubSendBody = { type: 'SubscribeToIndicators' } & TRequestStreamOptions &
    TSubscribeToIndicatorsProps;

type TUnsubSendBody = {
    type: 'Unsubscribe';
};

export type TIndicatorsUpdate = TWithSnapshot & {
    type: 'Indicators';
    indicators: TIndicator[];
};

type TSendBody = TSubSendBody | TUnsubSendBody;
type TReceiveBody = TIndicatorsUpdate | TSubscribed;

export function subscribeToIndicatorsHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    props?: TSubscribeToIndicatorsProps,
    options?: THandlerStreamOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[subscribeToIndicatorsHandle]: init observable', {
        traceId,
        url,
        props,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        () => [
            {
                ...props,
                type: 'SubscribeToIndicators',
                updatesOnly: options?.updatesOnly,
                pollInterval: pollIntervalForRequest(options?.pollInterval ?? toMilliseconds(1000)),
            },
            { type: 'Unsubscribe' },
        ],
        { ...options, traceId },
    ).pipe(
        map((envelope) => {
            if (envelope.payload.type === 'Indicators') {
                modifyIndicators(envelope.payload.indicators, url);
            }
            return envelope;
        }),
    );
}
