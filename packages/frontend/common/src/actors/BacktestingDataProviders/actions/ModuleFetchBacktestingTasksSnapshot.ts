import { isUndefined } from 'lodash-es';

import type { TFetchSnapshotParams, TFetchSortFieldsOrder } from '../../../modules/actions/def.ts';
import type {
    TBacktestingRunId,
    TBacktestingTask,
    TBacktestingTaskId,
} from '../../../types/domain/backtestings';
import type { TWithSocketTarget } from '../../../types/domain/sockets';
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

type TSendBody = TFetchSnapshotParams & {
    sort: TBacktestingTasksSnapshotSort;
    filters?: TBacktestingTasksSnapshotFilters;
};

type TReceiveBody = {
    btTasks: TBacktestingTask[];
};

export type TFetchBacktestingTasksSnapshotProps = TWithSocketTarget & {
    params: Omit<TFetchSnapshotParams, 'withTotal'>;
    sort?: TBacktestingTasksSnapshotSort;
    filters?: TBacktestingTasksSnapshotFilters;
    mods?: {
        withTotal?: boolean;
    };
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchBacktestTasksSnapshot,
    ERemoteProcedureType.Request,
);

export const ModuleFetchBacktestingTasksSnapshot = createRemoteProcedureCall(descriptor)({
    getParams: (props: TFetchBacktestingTasksSnapshotProps) => ({
        target: props.target,
        limit: props.params.limit,
        offset: props.params.offset,
        withTotal: props.mods?.withTotal,
        sort: {
            fieldsOrder: isUndefined(props.sort?.fieldsOrder)
                ? undefined
                : selectOnlyAvailableSortableFields(props.sort.fieldsOrder),
        },
        filters: props.filters,
    }),
    getPipe: () =>
        mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload.btTasks)),
});
