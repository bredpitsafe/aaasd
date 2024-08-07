import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/common';
import type {
    TImportDashboardRequest,
    TImportDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';
import { randomUUID } from 'crypto';
import { intersection, isNil } from 'lodash-es';
import { map, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import { getDashboardsByDigest, upsertDashboard } from '../../db/dashboards.ts';
import type { TUpdatableGrpcPermissionRow } from '../../db/permissions.ts';
import { getPermissions, upsertPermissions } from '../../db/permissions.ts';
import { getDigest } from '../../db/utils.ts';
import { EActorName } from '../../def/actor.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';

export const importDashboard: UnaryRpc<TImportDashboardRequest, TImportDashboardResponse> =
    function importDashboard(call, callback) {
        const { logger, messageWithContext, username, logStart, payload, handle$ } =
            handleUnaryRpcInitialization({
                rpc: importDashboard,
                call,
                callback,
                actor: EActorName.Dashboards,
            });

        logStart();

        const grpcPermissionRow: TUpdatableGrpcPermissionRow = {
            user: username,
            permission: 'PERMISSION_OWNER',
        };

        handle$({
            obs$: of(undefined).pipe(
                switchMap(async () => {
                    // Deduplicate existing dashboards by digest (per user)
                    const digest = getDigest(payload.config);
                    const dashboardIds = (await getDashboardsByDigest(digest)).map((d) => d.id);
                    const allowedLevels: TPermission[] = [
                        'PERMISSION_OWNER',
                        'PERMISSION_EDITOR',
                        'PERMISSION_VIEWER',
                    ];
                    const permissionDashboardIds = (
                        await getPermissions({ allowedLevels, user: username })
                    ).map((p) => p.dashboardId);
                    let id: string | undefined = intersection(
                        dashboardIds,
                        permissionDashboardIds,
                    )[0];

                    if (!isNil(id)) {
                        logger.info({
                            message: messageWithContext('dashboard duplicate found by digest'),
                            id,
                            digest,
                        });

                        return Promise.resolve(id);
                    }

                    id = randomUUID();

                    logger.info({
                        message: messageWithContext('creating a new dashboard'),
                        id,
                    });

                    return upsertDashboard({ ...payload, status: 'STATUS_ACTIVE', id });
                }),
                tap((id) => {
                    logger.info({
                        message: messageWithContext('dashboard created if not exists'),
                        id,
                    });
                }),
                switchMap((id) => upsertPermissions(id, [grpcPermissionRow])),
                map((id) => {
                    logger.info({
                        message: messageWithContext('permissions upserted'),
                        id,
                    });

                    return { id };
                }),
            ),
        });
    };
