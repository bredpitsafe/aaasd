import type { TContextRef } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import type { TStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import { assertNever } from '@frontend/common/src/utils/assert';
import { switchMapDesc, tapDesc } from '@frontend/common/src/utils/Rx/desc';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import type { Observable } from 'rxjs';
import { EMPTY, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { updateDashboardPermissionsEnvBox } from '../../../actors/FullDashboards/envelope';
import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { tapRuntimeError } from '../../utils';

export function updateDashboardPermissions(
    ctx: TContextRef,
    dashboardItemKey: TDashboardItemKey,
    permissions: TStorageDashboardPermission[],
    traceId: TraceId,
): Observable<boolean> {
    const actor = ModuleActor(ctx);

    const { loading, success } = ModuleMessages(ctx);
    const { error } = ModuleNotifications(ctx);

    const closeLoading = loading(`Updating Dashboard Permissions...`);

    return updateDashboardPermissionsEnvBox
        .requestStream(actor, {
            traceId,
            props: { dashboardItemKey, permissions },
        })
        .pipe(
            tapRuntimeError(error),
            tapDesc({
                synchronized: () => void success('Updated Dashboard Permissions'),
                fail: ({ code, meta }) => {
                    switch (code) {
                        case '[UpdateDashboardPermissions]: AUTHORIZATION':
                        case '[UpdateDashboardPermissions]: NOT_FOUND':
                        case '[UpdateDashboardPermissions]: SERVER_NOT_PROCESSED':
                            error({
                                message: 'Failed to update Dashboard Permissions',
                                description: meta.message,
                                traceId: meta.traceId,
                            });
                            break;
                        case '[UpdateDashboardPermissions]: UNKNOWN':
                            error({
                                message: 'UI Error',
                                description: meta,
                            });
                            break;
                        default:
                            assertNever(code);
                    }
                },
            }),
            switchMapDesc({
                idle: () => EMPTY,
                unsynchronized: () => EMPTY,
                synchronized: () => of(true),
                fail: () => of(false),
            }),
            finalize(closeLoading),
        );
}
