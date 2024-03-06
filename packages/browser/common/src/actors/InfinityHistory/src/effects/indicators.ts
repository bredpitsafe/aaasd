import { finalize } from 'rxjs/operators';

import { TContextRef } from '../../../../di';
import { ModuleCommunicationHandlersRemoted } from '../../../../modules/communicationRemoteHandlers';
import { ModuleRegisterActorRemoteProcedure } from '../../../../utils/RPC/registerRemoteProcedure';
import { isSubscriptionEventUpdate } from '../../../../utils/Rx/subscriptionEvents';
import { tapValueDescriptor } from '../../../../utils/Rx/ValueDescriptor2';
import { loggerInfinitySnapshot } from '../../../../utils/Tracing/Children/infinitySnapshot';
import { convertArrayToLogMessage } from '../../../../utils/Tracing/utils';
import {
    requestIndicatorsItemsProcedureDescriptor,
    subscribeToIndicatorsUpdatesProcedureDescriptor,
} from '../../envelope';
import { indicatorsInfinitySnapshotBank } from '../indicatorsInfinitySnapshotBank';

export function initIndicatorsEffects(ctx: TContextRef) {
    const { request, requestStream } = ModuleCommunicationHandlersRemoted(ctx);
    const registerActorRemoteProcedure = ModuleRegisterActorRemoteProcedure(ctx);

    registerActorRemoteProcedure(requestIndicatorsItemsProcedureDescriptor, (props, options) => {
        const { value, key } = indicatorsInfinitySnapshotBank.borrow({
            request,
            requestStream,
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
    });

    registerActorRemoteProcedure(
        subscribeToIndicatorsUpdatesProcedureDescriptor,
        (props, options) => {
            const { value, key } = indicatorsInfinitySnapshotBank.borrow({
                request,
                requestStream,
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
