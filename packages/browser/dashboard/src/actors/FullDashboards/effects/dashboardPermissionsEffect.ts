import type { TContextRef } from '@frontend/common/src/di';
import type { TStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { assertNever } from '@frontend/common/src/utils/assert';
import { mapDesc } from '@frontend/common/src/utils/Rx/desc';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { of } from 'rxjs';
import type { Actor, ActorContext } from 'webactor';

import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';
import { createDashboardPermissionSubscriptionFactory } from '../actions/dashboardsStorage/createDashboardPermissionSubscriptionFactory';
import { subscribeDashboardPermissionsEnvBox } from '../envelope';
import type { TDashboardActionFailDesc } from '../types';

const createFail = FailFactory('SubscribeDashboardPermissions');
const descFactory = ValueDescriptorFactory<
    TStorageDashboardPermission[],
    TDashboardActionFailDesc<'SubscribeDashboardPermissions'>
>();

export type TSubscribeDashboardPermissionsReturnType = ExtractValueDescriptor<typeof descFactory>;

export function dashboardPermissionsEffect(ctx: TContextRef, context: Actor | ActorContext) {
    const getDashboardPermissions$ = createDashboardPermissionSubscriptionFactory(ctx);

    subscribeDashboardPermissionsEnvBox.responseStream(context, ({ traceId, dashboardItemKey }) => {
        if (!isStorageDashboardItemKey(dashboardItemKey)) {
            return of(descFactory.sync([], null));
        }

        return getDashboardPermissions$(dashboardItemKey.storageId, traceId).pipe(
            mapDesc({
                idle: () => descFactory.idle(),
                unsynchronized: () => descFactory.unsc(null),
                synchronized: (value) => descFactory.sync(value, null),
                fail: ({ code, meta }) => {
                    switch (code) {
                        case '[SubscribeServerDashboardPermissions]: UNKNOWN':
                            return descFactory.fail(createFail('UNKNOWN', meta));
                        case '[SubscribeServerDashboardPermissions]: NOT_FOUND':
                            return descFactory.fail(createFail('NOT_FOUND', meta));
                        case '[SubscribeServerDashboardPermissions]: AUTHORIZATION':
                            return descFactory.fail(createFail('AUTHORIZATION', meta));
                        case '[SubscribeServerDashboardPermissions]: SERVER_NOT_PROCESSED':
                            return descFactory.fail(createFail('SERVER_NOT_PROCESSED', meta));
                        default:
                            assertNever(code);
                    }
                },
            }),
        );
    });
}
