import type { TRequestStreamOptions, TSubscribed, TWithSnapshot } from '../../../handlers/def';
import {
    convertToSubscriptionEventValueDescriptor,
    pollIntervalForRequest,
} from '../../../handlers/utils';
import type { TBacktestingRunId, TBacktestingTask } from '../../../types/domain/backtestings';
import { TSocketStruct, TSocketURL } from '../../../types/domain/sockets';
import type { Milliseconds, Nanoseconds } from '../../../types/time';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../../utils/RPC/defs';
import { milliseconds2nanoseconds } from '../../../utils/time';
import { TBacktestingTasksSnapshotFilters } from './ModuleFetchBacktestingTasksSnapshot';

type TSendBody = TRequestStreamOptions & {
    since?: Nanoseconds;
    till?: Nanoseconds;
    filters?: {
        btRuns?: Array<TBacktestingRunId>;
    };
};

type TReceiveBody =
    | TSubscribed
    | (TWithSnapshot & {
          type: 'BacktestTask';
          tasks: TBacktestingTask[];
      });

export type TSubscribeToBacktestingTasksParams = {
    target: TSocketURL | TSocketStruct;
    since?: Milliseconds;
    till?: Milliseconds;
    filters?: TBacktestingTasksSnapshotFilters;
    updatesOnly?: boolean;
    pollInterval?: Milliseconds;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToBacktestTasks,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToBacktestingTasks = createRemoteProcedureCall(descriptor)({
    getParams: (params: TSubscribeToBacktestingTasksParams) => ({
        target: params.target,
        since: params.since ? milliseconds2nanoseconds(params.since) : (0 as Nanoseconds),
        till: params.till && milliseconds2nanoseconds(params.till),
        filters: params.filters,
        updatesOnly: params.updatesOnly,
        pollInterval: pollIntervalForRequest(params.pollInterval),
    }),
    getPipe: () => convertToSubscriptionEventValueDescriptor((payload) => payload.tasks),
});
