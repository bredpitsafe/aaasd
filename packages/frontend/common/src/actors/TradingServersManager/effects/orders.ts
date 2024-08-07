import { finalize } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { ModuleRegisterActorRemoteProcedure } from '../../../utils/RPC/registerRemoteProcedure.ts';
import {
    fetchOrdersSnapshotProcedureDescriptor,
    subscribeToOrdersUpdatesProcedureDescriptor,
} from '../descriptors.ts';
import { ModuleOrdersInfinitySnapshotBank } from '../modules/ModuleOrdersInfinitySnapshotBank.ts';

export function initOrdersEffects(ctx: TContextRef) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const ordersInfinitySnapshotBank = ModuleOrdersInfinitySnapshotBank(ctx);

    register(fetchOrdersSnapshotProcedureDescriptor, (props, options) => {
        const { value, key } = ordersInfinitySnapshotBank.borrow({
            target: props.target,
            sort: props.sort,
            filters: props.filters,
        });

        return value.getItems(options.traceId, props.params.offset, props.params.limit).pipe(
            finalize(() => {
                ordersInfinitySnapshotBank.release(key);
            }),
        );
    });

    register(subscribeToOrdersUpdatesProcedureDescriptor, (props, options) => {
        const { value, key } = ordersInfinitySnapshotBank.borrow({
            target: props.target,
            sort: props.sort,
            filters: props.filters,
        });

        return value.subscribeToUpdates(options.traceId).pipe(
            finalize(() => {
                ordersInfinitySnapshotBank.release(key);
            }),
        );
    });
}
