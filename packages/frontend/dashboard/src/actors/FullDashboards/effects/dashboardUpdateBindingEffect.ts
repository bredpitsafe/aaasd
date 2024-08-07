import type { TContextRef } from '@frontend/common/src/di';
import { ModuleRegisterActorRemoteProcedure } from '@frontend/common/src/utils/RPC/registerRemoteProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEqual, isNil } from 'lodash-es';
import type { BehaviorSubject } from 'rxjs';

import { ModuleUpdateDashboardScopeBinding } from '../actions/dashboardsStorage/updateDashboardScopeBinding.ts';
import { updateDashboardScopeBindingProcedureDescriptor } from '../descriptors.ts';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache.ts';

export function dashboardUpdateBindingEffect(
    ctx: TContextRef,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
) {
    const register = ModuleRegisterActorRemoteProcedure(ctx);
    const updateDashboardScopeBinding = ModuleUpdateDashboardScopeBinding(ctx);

    register(updateDashboardScopeBindingProcedureDescriptor, (params, options) => {
        const memoryDashboards = memoryDashboardsSubject.getValue();

        const dashboardItem = memoryDashboards.get({
            storageId: params.dashboardId,
        });

        if (!isNil(dashboardItem)) {
            const newScopes =
                params.action === 'bind'
                    ? [...dashboardItem.item.scopes, params.scope]
                    : dashboardItem.item.scopes.filter((scope) => !isEqual(scope, params.scope));

            memoryDashboardsSubject.next(
                DashboardsMemoryCache.set(memoryDashboards, {
                    ...dashboardItem,
                    item: { ...dashboardItem.item, scopes: newScopes },
                }),
            );
        }

        return updateDashboardScopeBinding(params, options).pipe(
            mapValueDescriptor(() => createSyncedValueDescriptor(true as const)),
        );
    });
}
