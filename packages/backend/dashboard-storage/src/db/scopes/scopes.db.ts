import { assertFail } from '@common/utils';
import type { TUpdateDashboardScopeBindingRequest } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/scope_api';

import type { TScope } from '../../def/scope.ts';
import { ETable } from '../constants.ts';
import { client } from '../postgres/index.ts';
import { stringifyScope } from './scopes.utils.ts';

export async function upsertDashboardScopeBinding({
    dashboardId,
    scope,
    action,
}: TUpdateDashboardScopeBindingRequest): Promise<void> {
    const sortedScopeEntries = stringifyScope(scope);

    switch (action) {
        case 'SCOPE_BINDING_ACTION_BIND':
            await client.insert<TScope>({
                table: ETable.Scopes,
                values: [{ dashboardId, sortedScopeEntries }],
                upsert: 'dashboard_id, sorted_scope_entries',
            });
            break;
        case 'SCOPE_BINDING_ACTION_UNBIND': {
            await client.delete<TScope>({
                table: ETable.Scopes,
                conditions: { dashboardId, sortedScopeEntries },
            });
            break;
        }
        case 'SCOPE_BINDING_ACTION_UNSPECIFIED':
        default:
            assertFail(action);
    }
}
