import { isUndefined } from 'lodash-es';

import { selectOnlyAvailableSortableFields } from '../../../handlers/backtesting/utils';
import { TFetchSnapshotParams, TFetchSortFieldsOrder } from '../../../handlers/def';
import type {
    TBacktestingRunId,
    TBacktestingTask,
    TBacktestingTaskId,
} from '../../../types/domain/backtestings';
import { TSocketURL } from '../../../types/domain/sockets';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { ERemoteProcedureType, EServerRemoteProcedureName } from '../../../utils/RPC/defs';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';

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
    EServerRemoteProcedureName.FetchBacktestTasksSnapshot,
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
    getPipe: () => mapValueDescriptor(({ value }) => value.payload.btTasks),
});
