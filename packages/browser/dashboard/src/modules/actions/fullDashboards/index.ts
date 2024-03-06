import { ModuleFactory, TContextRef } from '@frontend/common/src/di';

import { fetchDashboardIdByLegacyId } from './fetchDashboardIdByLegacyId';
import { getDashboardList } from './getDashboardList';
import { getDashboardPermissionsFactory } from './getDashboardPermissionsFactory';
import { registerExternalDashboard } from './registerExternalDashboard';
import { subscribeToDashboardUsersFactory } from './subscribeToDashboardUsersFactory';

function createModule(ctx: TContextRef) {
    return {
        dashboardList$: getDashboardList(ctx),
        fetchDashboardIdByLegacyId: fetchDashboardIdByLegacyId.bind(null, ctx),
        registerExternalDashboard: registerExternalDashboard.bind(null, ctx),
        getDashboardPermissions$: getDashboardPermissionsFactory(ctx),
        getDashboardUsers$: subscribeToDashboardUsersFactory(ctx),
    };
}

export const ModuleDashboardsStorage = ModuleFactory(createModule);
