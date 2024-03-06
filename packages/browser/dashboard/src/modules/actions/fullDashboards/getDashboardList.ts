import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { assertNever } from '@frontend/common/src/utils/assert';
import { tapDesc } from '@frontend/common/src/utils/Rx/desc';
import type { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import type { TSubscribeDashboardListReturnType } from '../../../actors/FullDashboards/effects/dashboardsListEffect';
import { getDashboardsListEnvBox } from '../../../actors/FullDashboards/envelope';
import { tapRuntimeError } from '../../utils';

export function getDashboardList(ctx: TContextRef): Observable<TSubscribeDashboardListReturnType> {
    const actor = ModuleActor(ctx);
    const { error } = ModuleNotifications(ctx);

    return getDashboardsListEnvBox.requestStream(actor, undefined).pipe(
        tapRuntimeError(error),
        tapDesc({
            fail: ({ code, meta }) => {
                switch (code) {
                    case '[SubscribeDashboardList]: UNKNOWN':
                        error({
                            message: 'UI Error',
                            description: meta,
                        });
                        break;
                    case '[SubscribeDashboardList]: SERVER_NOT_PROCESSED':
                        error({
                            message: 'Dashboards list subscription failed',
                            description: meta.message,
                            traceId: meta.traceId,
                        });
                        break;
                    default:
                        assertNever(code);
                }
            },
        }),
        shareReplay(1),
    );
}
