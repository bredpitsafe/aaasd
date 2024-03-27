import { tap } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import { getTraceId } from '../../../handlers/utils';
import { ModuleActor } from '../../../modules/actor';
import { ModuleCommunicationHandlersRemoted } from '../../../modules/communicationRemoteHandlers';
import { isSubscriptionEventUpdate } from '../../../utils/Rx/subscriptionEvents';
import { extractSyncedValueFromValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import { loggerInfinitySnapshot } from '../../../utils/Tracing/Children/infinitySnapshot';
import { convertArrayToLogMessage } from '../../../utils/Tracing/utils';
import { requestOrdersItemsEnvBox, subscribeToOrdersUpdatesEnvBox } from '../envelops';
import { ordersInfinitySnapshotBank } from '../ordersInfinitySnapshotBank';

export function initOrdersEffects(ctx: TContextRef) {
    const actor = ModuleActor(ctx);
    const { request, requestStream } = ModuleCommunicationHandlersRemoted(ctx);

    requestOrdersItemsEnvBox.response(actor, (payload) => {
        const traceId = getTraceId(payload.options);
        const { value, key } = ordersInfinitySnapshotBank.borrow({
            request,
            requestStream,
            url: payload.url,
            sort: payload.props.sort,
            filters: payload.props.filters,
        });

        loggerInfinitySnapshot.info('requestOrdersItems', {
            traceId,
            payload,
        });

        return value.getItems(traceId, payload.props.offset, payload.props.limit).pipe(
            extractSyncedValueFromValueDescriptor(),
            tap({
                next: (items) => {
                    loggerInfinitySnapshot.info('requestOrdersItems.response', {
                        traceId,
                        items: convertArrayToLogMessage(items),
                    });
                },
                error: (error) => {
                    loggerInfinitySnapshot.error('requestOrdersItems.fail', {
                        traceId,
                        error,
                    });
                },
                finalize: () => {
                    ordersInfinitySnapshotBank.release(key);
                },
            }),
        );
    });

    subscribeToOrdersUpdatesEnvBox.responseStream(actor, (payload) => {
        const traceId = getTraceId(payload.options);
        const { value, key } = ordersInfinitySnapshotBank.borrow({
            request,
            requestStream,
            url: payload.url,
            sort: payload.props.sort,
            filters: payload.props.filters,
        });

        loggerInfinitySnapshot.info('subscribeToOrdersUpdates', {
            traceId,
            payload,
        });

        return value.subscribeToUpdates(traceId).pipe(
            extractSyncedValueFromValueDescriptor(),
            tap({
                next: (event) => {
                    loggerInfinitySnapshot.info(`subscribeToOrdersUpdates.${event.type}`, {
                        traceId,
                        items: isSubscriptionEventUpdate(event)
                            ? convertArrayToLogMessage(event.payload)
                            : undefined,
                    });
                },
                error: (error) => {
                    loggerInfinitySnapshot.error('subscribeToOrdersUpdates.fail', {
                        traceId,
                        error,
                    });
                },
                finalize: () => {
                    ordersInfinitySnapshotBank.release(key);
                },
            }),
        );
    });
}
