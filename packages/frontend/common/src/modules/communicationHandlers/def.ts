import type { Assign } from '@common/types';
import type { TraceId } from '@common/utils';
import type { Observable } from 'rxjs';

import type { TReceivedData, TSendPayload } from '../../lib/BFFSocket/def';
import type { TSocketStreamOptions } from '../../lib/SocketStream/def';
import type { TSocketStruct, TSocketURL } from '../../types/domain/sockets';
import type { TStructurallyCloneableObject } from '../../types/serialization';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import type { TUnsubscribe, TWithTraceId } from '../actions/def.ts';

export type THandlerOptions = Omit<TSocketStreamOptions, 'traceId'> &
    Partial<TWithTraceId> & {
        timeout?: number;
        enableRetries?: boolean;
        retries?: number;
        retryOnReconnect?: boolean;
        enableLogs?: boolean;
        skipAuthentication?: boolean;
    };

export type TStreamSender<SendBody> = () => [SendBody] | [SendBody, TUnsubscribe];

export type TStreamHandler = <
    SendBody extends TSendPayload,
    ReceiveBody extends TStructurallyCloneableObject,
    EnableVD extends boolean = false,
>(
    target: TSocketURL | TSocketStruct,
    sender: TStreamSender<SendBody>,
    options?: THandlerOptions & { enableVD?: EnableVD },
) => Observable<
    EnableVD extends true
        ? TValueDescriptor2<TReceivedData<ReceiveBody>>
        : TReceivedData<ReceiveBody>
>;

export type TFetchHandler = <
    SendBody extends TSendPayload,
    ReceiveBody extends TStructurallyCloneableObject,
    EnableVD extends boolean = false,
>(
    target: TSocketURL | TSocketStruct,
    body: SendBody,
    options?: THandlerOptions & { enableVD?: EnableVD },
) => Observable<
    EnableVD extends true
        ? TValueDescriptor2<TReceivedData<ReceiveBody>>
        : TReceivedData<ReceiveBody>
>;

export type TRequiredHandlerOptions = Assign<
    THandlerOptions,
    typeof DEFAULT_OPTIONS & {
        traceId: TraceId;
    }
>;

export const DEFAULT_OPTIONS: Required<
    Pick<
        THandlerOptions,
        | 'enableRetries'
        | 'retries'
        | 'retryOnReconnect'
        | 'timeout'
        | 'enableLogs'
        | 'waitForResponse'
    >
> = {
    timeout: 10_000,
    enableRetries: true,
    retries: 3,
    retryOnReconnect: true,
    enableLogs: true,
    waitForResponse: true,
};
