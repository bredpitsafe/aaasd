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
import { updateDashboardShareSettings } from '../actions/dashboardsStorage/updateDashboardShareSettings';
import { updateDashboardShareSettingsEnvBox } from '../envelope';
import type { TDashboardActionFailDesc } from '../types';

const createFail = FailFactory('UpdateDashboardSettings');
const descFactory = ValueDescriptorFactory<
    boolean,
    TDashboardActionFailDesc<'UpdateDashboardSettings'>
>();

export type TUpdateDashboardSettingsReturnType = ExtractValueDescriptor<typeof descFactory>;

export function dashboardShareSettingsUpdateEffect(
    ctx: TContextRef,
    context: Actor | ActorContext,
) {
    updateDashboardShareSettingsEnvBox.responseStream(
        context,
        ({ traceId, props: { dashboardItemKey, sharePermission } }) => {
            if (!isStorageDashboardItemKey(dashboardItemKey)) {
                return of(descFactory.sync(false, null));
            }

            return updateDashboardShareSettings(
                ctx,
                traceId,
                dashboardItemKey.storageId,
                sharePermission,
            ).pipe(
                mapDesc({
                    idle: () => descFactory.idle(),
                    unsynchronized: () => descFactory.unsc(null),
                    synchronized: (value) => descFactory.sync(value, null),
                    fail: ({ code, meta }) => {
                        switch (code) {
                            case '[UpdateServerDashboardShareSettings]: UNKNOWN':
                                return descFactory.fail(createFail('UNKNOWN', meta));
                            case '[UpdateServerDashboardShareSettings]: NOT_FOUND':
                                return descFactory.fail(createFail('NOT_FOUND', meta));
                            case '[UpdateServerDashboardShareSettings]: AUTHORIZATION':
                                return descFactory.fail(createFail('AUTHORIZATION', meta));
                            case '[UpdateServerDashboardShareSettings]: SERVER_NOT_PROCESSED':
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
