import { type Observable, catchError, map, of, startWith } from 'rxjs';

import { EHerodotusTaskStatus, THerodotusTask } from '../../../herodotus/src/types/domain';
import { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import { TRobotId } from '../types/domain/robots';
import { TSocketURL } from '../types/domain/sockets';
import { FailFactory } from '../types/Fail';
import { logger } from '../utils/Tracing';
import { ExtractValueDescriptor, ValueDescriptorFactory } from '../utils/ValueDescriptor';

const DEFAULT_LIMIT = 100;

type TSendBody = {
    type: 'FetchHerodotusTasksSnapshot';
    params: {
        limit: number;
        offset: number;
    };
    filters: {
        robotId: TRobotId;
        statuses?: Array<EHerodotusTaskStatus>;
    };
};

type TReceiveBody = {
    entities: Array<THerodotusTask>;
};

type TParams = {
    filters: {
        robotId: TRobotId;
        statuses?: Array<EHerodotusTaskStatus>;
    };
    limit?: number;
};

const HerodotusTasksSnapshotFetchFail = FailFactory('fetchHerodotusTasksSnapshotHandle');
const UNKNOWN_FAIL = HerodotusTasksSnapshotFetchFail('UNKNOWN');
const HerodotusTasksSnapshotFetch = ValueDescriptorFactory<
    Array<THerodotusTask>,
    typeof UNKNOWN_FAIL
>();
type TResult = ExtractValueDescriptor<typeof HerodotusTasksSnapshotFetch>;

export function fetchHerodotusTasksSnapshotHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    { limit, filters }: TParams,
    options: THandlerOptions,
): Observable<TResult> {
    logger.trace('[fetchHerodotusTasksSnapshotHandle]', {
        url,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchHerodotusTasksSnapshot',
            params: {
                limit: limit ?? DEFAULT_LIMIT,
                offset: 0,
            },
            filters,
        },
        options,
    ).pipe(
        map((envelop) => {
            return HerodotusTasksSnapshotFetch.sync(envelop.payload.entities, null);
        }),
        catchError((error) => {
            logger.error('[fetchHerodotusTasksSnapshotHandle]', {
                error,
                traceId: options.traceId,
            });

            return of(HerodotusTasksSnapshotFetch.fail(UNKNOWN_FAIL));
        }),
        startWith(HerodotusTasksSnapshotFetch.unsc(null)),
    );
}
