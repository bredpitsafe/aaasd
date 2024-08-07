import { finalize } from 'rxjs/operators';

import type { TContextRef } from '../../../../di';
import { ModuleRegisterActorRemoteProcedure } from '../../../../utils/RPC/registerRemoteProcedure.ts';
import {
    requestBacktestingTaskItemsProcedureDescriptor,
    subscribeToBacktestingTaskUpdatesProcedureDescriptor,
} from '../../descriptors.ts';
import { ModuleBacktestingTasksInfinitySnapshotBank } from '../backtestingTasksInfinitySnapshotBank';

export function initBacktestingTasksEffects(ctx: TContextRef) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const bank = ModuleBacktestingTasksInfinitySnapshotBank(ctx);

    register(requestBacktestingTaskItemsProcedureDescriptor, (props, options) => {
        const { value, key } = bank.borrow({
            target: props.target,
            sort: props.sort,
            filters: props.filters,
        });

        return value.getItems(options.traceId, props.params.offset, props.params.limit).pipe(
            finalize(() => {
                bank.release(key);
            }),
        );
    });

    register(subscribeToBacktestingTaskUpdatesProcedureDescriptor, (props, options) => {
        const { value, key } = bank.borrow({
            target: props.target,
            sort: props.sort,
            filters: props.filters,
        });

        return value.subscribeToUpdates(options.traceId).pipe(
            finalize(() => {
                bank.release(key);
            }),
        );
    });
}
