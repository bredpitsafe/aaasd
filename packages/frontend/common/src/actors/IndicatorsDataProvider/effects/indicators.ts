import { isSubscriptionEventUpdate } from '@common/rx';
import { finalize } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { ModuleRegisterActorRemoteProcedure } from '../../../utils/RPC/registerRemoteProcedure.ts';
import { tapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { loggerInfinitySnapshot } from '../../../utils/Tracing/Children/infinitySnapshot.ts';
import { convertArrayToLogMessage } from '../../../utils/Tracing/utils.ts';
import {
    fetchIndicatorsInfinitySnapshotProcedureDescriptor,
    subscribeToIndicatorsInfinitySnapshotProcedureDescriptor,
} from '../descriptors.ts';
import { indicatorsInfinitySnapshotBank } from '../storage/indicatorsInfinitySnapshotBank.ts';

export function initIndicatorsEffects(ctx: TContextRef) {
    const registerActorRemoteProcedure = ModuleRegisterActorRemoteProcedure(ctx);

    registerActorRemoteProcedure(
        fetchIndicatorsInfinitySnapshotProcedureDescriptor,
        (props, options) => {
            const { value, key } = indicatorsInfinitySnapshotBank.borrow({
                ctx,
                url: props.url,
                sort: props.sort,
                filters: props.filters,
            });

            return value.getItems(options.traceId, props.params.offset, props.params.limit).pipe(
                tapValueDescriptor(({ value: items }) => {
                    loggerInfinitySnapshot.info('[requestIndicatorsItems] Response', {
                        traceId: options.traceId,
                        items: convertArrayToLogMessage(items),
                    });
                }),
                finalize(() => {
                    indicatorsInfinitySnapshotBank.release(key);
                }),
            );
        },
    );

    registerActorRemoteProcedure(
        subscribeToIndicatorsInfinitySnapshotProcedureDescriptor,
        (props, options) => {
            const { value, key } = indicatorsInfinitySnapshotBank.borrow({
                ctx,
                url: props.url,
                sort: props.sort,
                filters: props.filters,
            });

            return value.subscribeToUpdates(options.traceId).pipe(
                tapValueDescriptor(({ value: event }) => {
                    loggerInfinitySnapshot.info('[subscribeToIndicatorsUpdates] Update', {
                        traceId: options.traceId,
                        items: isSubscriptionEventUpdate(event)
                            ? convertArrayToLogMessage(event.payload)
                            : undefined,
                    });
                }),
                finalize(() => {
                    indicatorsInfinitySnapshotBank.release(key);
                }),
            );
        },
    );
}
