import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/common';
import type {
    TFetchDashboardConfigRequest,
    TFetchDashboardConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';
import { isNil } from 'lodash-es';
import { finalize, from, map, switchMap } from 'rxjs';

import { getDashboardAtRevision, getDashboardById } from '../../db/dashboards.ts';
import { getPermissions } from '../../db/permissions.ts';
import { EActorName } from '../../def/actor.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { metrics } from '../../utils/metrics.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';
import { getMaxPermission } from '../permissions/utils.ts';

export const fetchDashboardConfig: UnaryRpc<
    TFetchDashboardConfigRequest,
    TFetchDashboardConfigResponse
> = function fetchDashboardConfig(call, callback) {
    const { logger, messageWithContext, username, logStart, payload, handle$ } =
        handleUnaryRpcInitialization({
            rpc: fetchDashboardConfig,
            call,
            callback,
            actor: EActorName.Dashboards,
        });

    logStart({
        id: payload.id,
    });
    metrics.dashboards.dashboard.inc();

    const allowedLevels: TPermission[] = [
        'PERMISSION_OWNER',
        'PERMISSION_EDITOR',
        'PERMISSION_VIEWER',
    ];

    handle$({
        obs$: from(
            getPermissions({
                user: username,
                id: payload.id,
                allowedLevels,
            }),
        ).pipe(
            finalize(() => metrics.dashboards.dashboard.dec()),
            map((permissionRows) => {
                logger.info({
                    message: messageWithContext('permissions received'),
                    id: payload.id,
                    permissionRows,
                });

                if (permissionRows.length === 0) {
                    throw new ActorError({
                        kind: EActorErrorKind.Authorization,
                        title: 'Failed to fetch dashboard',
                        description: 'You do not have permission to view this dashboard',
                    });
                }

                return getMaxPermission(permissionRows);
            }),
            switchMap(({ permissionRow }) => {
                const { dashboardId } = permissionRow;
                logger.info({
                    message: messageWithContext('permissions checked, loading dashboard'),
                    permissionRow,
                });

                return isNil(payload.digest)
                    ? getDashboardById(dashboardId)
                    : getDashboardAtRevision(dashboardId, payload.digest);
            }),
            map((dashboard) => {
                if (isNil(dashboard)) {
                    throw new ActorError({
                        kind: EActorErrorKind.NotFound,
                        title: 'Dashboard not found',
                        description: 'Dashboard may have been deleted from storage by the owner',
                    });
                }

                logger.info({
                    message: messageWithContext('dashboard received'),
                    id: payload.id,
                    dashboard: dashboard.id,
                    digest: dashboard.digest,
                });

                return dashboard;
            }),
            map((dashboard) => {
                return {
                    config: dashboard.config,
                    digest: dashboard.digest,
                };
            }),
        ),
        responseLogParams: (res) => ({
            id: payload.id,
            digest: payload.digest,
            configSize: res.config.length,
        }),
    });
};
