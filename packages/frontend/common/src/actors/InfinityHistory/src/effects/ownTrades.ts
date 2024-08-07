import { finalize } from 'rxjs/operators';

import type { TContextRef } from '../../../../di';
import { EFetchHistoryDirection } from '../../../../modules/actions/def.ts';
import { ModuleRegisterActorRemoteProcedure } from '../../../../utils/RPC/registerRemoteProcedure.ts';
import {
    requestOwnTradeItemsProcedureDescriptor,
    subscribeToOwnTradeUpdatesProcedureDescriptor,
} from '../../descriptors.ts';
import { ModuleOwnTradesInfinityHistoryBank } from '../ModuleOwnTradesInfinityHistoryBank.ts';

export function initOwnTradesEffects(ctx: TContextRef) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const bank = ModuleOwnTradesInfinityHistoryBank(ctx);

    register(requestOwnTradeItemsProcedureDescriptor, (props, options) => {
        const { value, key } = bank.borrow({
            target: props.target,
            filters: props.filters,
            timeZone: props.params.timeZone,
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

    register(subscribeToOwnTradeUpdatesProcedureDescriptor, (props, options) => {
        const { value, key } = bank.borrow({
            target: props.target,
            filters: props.filters,
            timeZone: props.params.timeZone,
        });

        return value.subscribeToUpdates(options.traceId).pipe(
            finalize(() => {
                bank.release(key);
            }),
        );
    });
}
