import { finalize } from 'rxjs/operators';

import type { TContextRef } from '../../../../di';
import { EFetchHistoryDirection } from '../../../../modules/actions/def.ts';
import { ModuleRegisterActorRemoteProcedure } from '../../../../utils/RPC/registerRemoteProcedure.ts';
import {
    requestProductLogItemsProcedureDescriptor,
    subscribeToProductLogUpdatesProcedureDescriptor,
} from '../../descriptors.ts';
import { ModuleProductLogsInfinityHistoryBank } from '../ModuleProductLogsInfinityHistoryBank.ts';

export function initProductLogsEffects(ctx: TContextRef) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const bank = ModuleProductLogsInfinityHistoryBank(ctx);

    register(requestProductLogItemsProcedureDescriptor, (props, options) => {
        const { value, key } = bank.borrow({
            target: props.target,
            filters: props.filters,
        });

        return value
            .getItems(
                options.traceId,
                props.params.direction === EFetchHistoryDirection.Forward
                    ? props.params.limit
                    : -props.params.limit,
                props.params.timestamp,
                props.params.timestampBound,
            )
            .pipe(
                finalize(() => {
                    bank.release(key);
                }),
            );
    });

    register(subscribeToProductLogUpdatesProcedureDescriptor, (props, options) => {
        const { value, key } = bank.borrow({
            target: props.target,
            filters: props.filters,
        });

        return value.subscribeToUpdates(options.traceId).pipe(
            finalize(() => {
                bank.release(key);
            }),
        );
    });
}
