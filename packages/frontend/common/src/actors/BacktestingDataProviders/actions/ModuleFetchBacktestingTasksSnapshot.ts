import { isUndefined } from 'lodash-es';

import { TFetchSnapshotParams, TFetchSortFieldsOrder } from '../../../handlers/def';
import type {
    TBacktestingRunId,
    TBacktestingTask,
    TBacktestingTaskId,
} from '../../../types/domain/backtestings';
import { TSocketURL } from '../../../types/domain/sockets';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../../utils/RPC/defs';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import { selectOnlyAvailableSortableFields } from './utils.ts';

export type TBacktestingTaskLookupSortablePart = Pick<TBacktestingTask, 'id'>;

export type TBacktestingTasksSnapshotSortOrder =
    TFetchSortFieldsOrder<TBacktestingTaskLookupSortablePart>;

export type TBacktestingTasksSnapshotSort = {
    fieldsOrder?: TBacktestingTasksSnapshotSortOrder;
};

export type TBacktestingTasksSnapshotFilters = {
    ids?: Array<TBacktestingTaskId>;
    names?: Array<TBacktestingTask['name']>;
    authors?: Array<TBacktestingTask['user']>;
    btRuns?: Array<TBacktestingRunId>;
};

type TSendBody = {
    sort: TBacktestingTasksSnapshotSort;
    filters?: TBacktestingTasksSnapshotFilters;
} & TFetchSnapshotParams;

type TReceiveBody = {
    btTasks: TBacktestingTask[];
};

type TParams = {
    target: TSocketURL;
    sort: TBacktestingTasksSnapshotSort;
    slice: {
        limit: number;
        offset: number;
    };
    filters?: TBacktestingTasksSnapshotFilters;
    mods: {
        withTotal: boolean;
    };
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchBacktestTasksSnapshot,
    ERemoteProcedureType.Request,
);

export const ModuleFetchBacktestingTasksSnapshot = createRemoteProcedureCall(descriptor)({
    getParams: (params: TParams) => ({
        target: params.target,
        limit: params.slice.limit,
        offset: params.slice.offset,
        sort: {
            fieldsOrder: isUndefined(params.sort.fieldsOrder)
                ? undefined
                : selectOnlyAvailableSortableFields(params.sort.fieldsOrder),
        },
        filters: params.filters,
        mods: params.mods,
    }),
    getPipe: () =>
        mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload.btTasks)),
});
