import { TraceId } from '../../utils/traceId';

export type TSocketStreamOptions = {
    traceId: TraceId;
    waitForResponse?: boolean;
};

export enum EErrorReason {
    authentication = 'authentication',
    timeout = 'timeout',
    socketClose = 'socketClose',
    serverError = 'serverError',
    serverAbort = 'serverAbort',
}

// Workaround for special `Unspecified` payload
export type TUnspecified = {
    type: 'Unspecified';
    description: string;
};
