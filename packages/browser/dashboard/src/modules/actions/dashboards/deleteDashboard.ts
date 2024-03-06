import type { TContextRef } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { assertNever } from '@frontend/common/src/utils/assert';
import { switchMapDesc, tapDesc } from '@frontend/common/src/utils/Rx/desc';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import type { Observable } from 'rxjs';
import { EMPTY, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { deleteDashboardEnvBox } from '../../../actors/FullDashboards/envelope';
import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { tapRuntimeError } from '../../utils';

export function deleteDashboard(
    ctx: TContextRef,
    traceId: TraceId,
    dashboardItemKey: TDashboardItemKey,
): Observable<boolean> {
    const actor = ModuleActor(ctx);

    const { loading, success } = ModuleMessages(ctx);
    const { error } = ModuleNotifications(ctx);

    const closeLoading = loading(`Removing dashboard from the list...`);

    return deleteDashboardEnvBox.requestStream(actor, { traceId, dashboardItemKey }).pipe(
        tapRuntimeError(error),
        tapDesc({
            synchronized: () => void success('Dashboard was removed from the list'),
            fail: ({ code, meta }) => {
                switch (code) {
                    case '[DeleteDashboard]: AUTHORIZATION':
                    case '[DeleteDashboard]: NOT_FOUND':
                    case '[DeleteDashboard]: SERVER_NOT_PROCESSED':
                        error({
                            message: 'Dashboard was not removed from the list',
                            description: meta.message,
                            traceId: meta.traceId,
                        });
                        break;
                    case '[DeleteDashboard]: UNKNOWN':
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
