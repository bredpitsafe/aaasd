import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/common';
import type {
    TRenameDashboardRequest,
    TRenameDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';
import { isNil } from 'lodash-es';
import { from, map, switchMap } from 'rxjs';

import { getDashboardById, upsertDashboard } from '../../db/dashboards.ts';
import { getPermissions } from '../../db/permissions.ts';
import { EActorName } from '../../def/actor.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';

export const renameDashboard: UnaryRpc<TRenameDashboardRequest, TRenameDashboardResponse> =
    function renameDashboard(call, callback) {
        const { logger, messageWithContext, username, logStart, payload, handle$ } =
            handleUnaryRpcInitialization({
                rpc: renameDashboard,
                call,
                callback,
                actor: EActorName.Dashboards,
            });

        logStart();

        const allowedLevels: TPermission[] = ['PERMISSION_OWNER', 'PERMISSION_EDITOR'];

        handle$({
            obs$: from(
                getPermissions({
                    id: payload.id,
                    user: username,
                    allowedLevels,
                }),
            ).pipe(
                map((permissionRows) => {
                    if (permissionRows.length === 0) {
                        throw new ActorError({
                            kind: EActorErrorKind.Authorization,
                            title: 'Failed to rename dashboard',
                            description: 'You do not have permission to rename this dashboard',
                        });
                    }
                }),
                switchMap(() => getDashboardById(payload.id)),
                switchMap((dashboard) => {
                    if (isNil(dashboard)) {
                        throw new ActorError({
                            kind: EActorErrorKind.NotFound,
                            title: 'Dashboard not found',
                            description: `Dashboard does not exist in storage. Nothing to rename.`,
                        });
                    }

                    if (dashboard.name === payload.name) {
                        throw new ActorError({
                            kind: EActorErrorKind.Validation,
                            title: 'Dashboard already has the same name',
                            description: `Dashboard will not be renamed.`,
                        });
                    }

                    return upsertDashboard({ ...dashboard, name: payload.name });
                }),
                map((id) => {
                    logger.info({
                        message: messageWithContext('dashboard upserted'),
                        id,
                    });

                    return {};
                }),
            ),
        });
    };
