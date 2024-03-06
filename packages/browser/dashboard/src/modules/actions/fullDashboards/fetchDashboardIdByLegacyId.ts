import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import type { TComponentId } from '@frontend/common/src/types/domain/component';
import { assertNever } from '@frontend/common/src/utils/assert';
import { tapDesc } from '@frontend/common/src/utils/Rx/desc';
import type { Observable } from 'rxjs';

import type { TFetchServerDashboardIdReturnType } from '../../../actors/FullDashboards/actions/dashboardsStorage/fetchDashboardIdByLegacyId';
import { fetchDashboardIdByLegacyIdEnvBox } from '../../../actors/FullDashboards/envelope';
import { tapRuntimeError } from '../../utils';

export function fetchDashboardIdByLegacyId(
    ctx: TContextRef,
    legacyId: TComponentId,
): Observable<TFetchServerDashboardIdReturnType> {
    const actor = ModuleActor(ctx);

    const { error } = ModuleNotifications(ctx);

    return fetchDashboardIdByLegacyIdEnvBox.requestStream(actor, legacyId).pipe(
        tapRuntimeError(error),
        tapDesc({
            fail: ({ code, meta }) => {
                switch (code) {
                    case '[FetchServerDashboardId]: UNKNOWN':
                        error({
                            message: 'UI Error',
                            description: meta,
                        });
                        break;
                    case '[FetchServerDashboardId]: SERVER_NOT_PROCESSED':
                        error({
                            message: 'Fail to resolve DashboardId by LegacyId',
                            description: meta.message,
                            traceId: meta.traceId,
                        });
                        break;
                    default:
                        assertNever(code);
                }
            },
        }),
    );
}
