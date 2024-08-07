import type { Milliseconds, Nanoseconds } from '@common/types';
import { milliseconds2nanoseconds } from '@common/utils';

import type {
    TRequestStreamOptions,
    TSubscribed,
    TWithSnapshot,
} from '../../../modules/actions/def.ts';
import {
    convertToSubscriptionEventValueDescriptor,
    pollIntervalForRequest,
} from '../../../modules/actions/utils.ts';
import type { TBacktestingRunId, TBacktestingTask } from '../../../types/domain/backtestings';
import type { TWithSocketTarget } from '../../../types/domain/sockets';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../../utils/RPC/defs';
import type { TBacktestingTasksSnapshotFilters } from './ModuleFetchBacktestingTasksSnapshot';

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

export type TSubscribeToBacktestingTasksProps = TWithSocketTarget & {
    params?: {
        since?: Milliseconds;
        till?: Milliseconds;
    };
    filters?: TBacktestingTasksSnapshotFilters;
    mods?: {
        updatesOnly?: boolean;
        pollInterval?: Milliseconds;
    };
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToBacktestTasks,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToBacktestingTasks = createRemoteProcedureCall(descriptor)({
    getParams: (props: TSubscribeToBacktestingTasksProps) => ({
        target: props.target,
        since: props.params?.since
            ? milliseconds2nanoseconds(props.params.since)
            : (0 as Nanoseconds),
        till: props.params?.till && milliseconds2nanoseconds(props.params.till),
        filters: props.filters,
        updatesOnly: props.mods?.updatesOnly,
        pollInterval: pollIntervalForRequest(props.mods?.pollInterval),
    }),
    getPipe: () => convertToSubscriptionEventValueDescriptor((payload) => payload.tasks),
});
