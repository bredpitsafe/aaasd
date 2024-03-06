import { catchError, map, Observable, of, startWith } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import type { TComponentId } from '../types/domain/component';
import { TSocketURL } from '../types/domain/sockets';
import { FailFactory } from '../types/Fail';
import { ValueDescriptor } from '../types/ValueDescriptor';
import { logger } from '../utils/Tracing';
import { FailDesc, SyncDesc, UnscDesc } from '../utils/ValueDescriptor';
import { getTraceId } from './utils';

type TParams = {
    componentId: TComponentId;
    state: string;
    parentDigest?: string;
};

type TSendBody = {
    type: 'UpdateComponentState';
    componentId: TComponentId;
    newStateRaw: string;
    currentDigest?: string;
};

export type TResultBody = {
    type: 'ComponentStateUpdated';
    componentId: TComponentId;
    digest: string;
};

const ComponentStateRevisionCreateFail = FailFactory('createComponentStateRevisionHandler');
const UNKNOWN = ComponentStateRevisionCreateFail('UNKNOWN');
export type TResultDescriptor = ValueDescriptor<TReceivedData<TResultBody>, typeof UNKNOWN, null>;

const TIMEOUT = 20_000;

export function createComponentStateRevisionHandler(
    handler: TFetchHandler,
    url: TSocketURL,
    params: TParams,
    options?: THandlerOptions,
): Observable<TResultDescriptor> {
    const traceId = getTraceId(options);

    logger.trace('[createComponentStateRevisionHandler]: init observable', { traceId });

    return handler<TSendBody, TResultBody>(
        url,
        {
            type: 'UpdateComponentState',
            componentId: params.componentId,
            newStateRaw: params.state,
            currentDigest: params.parentDigest,
        },
        { traceId, timeout: TIMEOUT },
    ).pipe(
        map((result): TResultDescriptor => SyncDesc(result, null)),
        catchError(() => of<TResultDescriptor>(FailDesc(UNKNOWN))),
        startWith(UnscDesc(null) as TResultDescriptor),
    );
}
