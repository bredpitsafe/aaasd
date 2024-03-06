import type { TContextRef } from '@frontend/common/src/di';
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
import { updateDashboardPermissions } from '../actions/dashboardsStorage/updateDashboardPermissions';
import { updateDashboardPermissionsEnvBox } from '../envelope';
import type { TDashboardActionFailDesc } from '../types';

const createFail = FailFactory('UpdateDashboardPermissions');
const descFactory = ValueDescriptorFactory<
    true,
    TDashboardActionFailDesc<'UpdateDashboardPermissions'>
>();

export type TUpdateDashboardPermissionsReturnType = ExtractValueDescriptor<typeof descFactory>;

export function dashboardPermissionsUpdateEffect(ctx: TContextRef, context: Actor | ActorContext) {
    updateDashboardPermissionsEnvBox.responseStream(
        context,
        ({ traceId, props: { dashboardItemKey, permissions } }) => {
            if (!isStorageDashboardItemKey(dashboardItemKey)) {
                return of(descFactory.sync(true, null));
            }

            return updateDashboardPermissions(
                ctx,
                traceId,
                dashboardItemKey.storageId,
                permissions,
            ).pipe(
                mapDesc({
                    idle: () => descFactory.idle(),
                    unsynchronized: () => descFactory.unsc(null),
                    synchronized: (value) => descFactory.sync(value, null),
                    fail: ({ code, meta }) => {
                        switch (code) {
                            case '[UpdateServerDashboardPermissions]: UNKNOWN':
                                return descFactory.fail(createFail('UNKNOWN', meta));
                            case '[UpdateServerDashboardPermissions]: NOT_FOUND':
                                return descFactory.fail(createFail('NOT_FOUND', meta));
                            case '[UpdateServerDashboardPermissions]: AUTHORIZATION':
                                return descFactory.fail(createFail('AUTHORIZATION', meta));
                            case '[UpdateServerDashboardPermissions]: SERVER_NOT_PROCESSED':
                                return descFactory.fail(createFail('SERVER_NOT_PROCESSED', meta));
                            default:
                                assertNever(code);
                        }
                    },
                }),
            );
        },
    );
}
