import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type {
    TCreateDashboardRequest,
    TCreateDashboardResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/dashboard_api';
import { randomUUID } from 'crypto';
import { from, map, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import { upsertDashboard } from '../../db/dashboards.ts';
import { upsertPermissions } from '../../db/permissions.ts';
import { EActorName } from '../../def/actor.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';

export const createDashboard: UnaryRpc<TCreateDashboardRequest, TCreateDashboardResponse> =
    function createDashboard(call, callback) {
        const { logger, messageWithContext, username, payload, logStart, handle$ } =
            handleUnaryRpcInitialization({
                rpc: createDashboard,
                call,
                callback,
                actor: EActorName.Dashboards,
            });

        logStart();

        handle$({
            obs$: from(
                upsertDashboard({ ...payload, status: 'STATUS_ACTIVE', id: randomUUID() }),
            ).pipe(
                tap((id) => {
                    logger.info({
                        message: messageWithContext('dashboard created'),
                        id,
                    });
                }),
                switchMap((id) =>
                    upsertPermissions(id, [
                        {
                            user: username,
                            permission: 'PERMISSION_OWNER',
                        },
                    ]),
                ),
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
