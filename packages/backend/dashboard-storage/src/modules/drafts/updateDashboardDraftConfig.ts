import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';
import type {
    TUpdateDashboardDraftConfigRequest,
    TUpdateDashboardDraftConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api.js';
import { isEmpty } from 'lodash-es';
import { from, map, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import { deleteDraft, upsertDraft } from '../../db/drafts.ts';
import { getPermissions } from '../../db/permissions.ts';
import { getDigest } from '../../db/utils.ts';
import { EActorName } from '../../def/actor.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { metrics } from '../../utils/metrics.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';

export const updateDashboardDraftConfig: UnaryRpc<
    TUpdateDashboardDraftConfigRequest,
    TUpdateDashboardDraftConfigResponse
> = function updateDashboardDraftConfig(call, callback) {
    const { logger, messageWithContext, username, logStart, payload, handle$ } =
        handleUnaryRpcInitialization({
            rpc: updateDashboardDraftConfig,
            call,
            callback,
            actor: EActorName.Drafts,
        });

    logStart(payload);

    const allowedLevels: TPermission[] = ['PERMISSION_OWNER', 'PERMISSION_EDITOR'];

    handle$({
        obs$: from(
            getPermissions({
                user: username,
                id: payload.id,
                allowedLevels,
            }),
        ).pipe(
            switchMap(async (permissionRows) => {
                logger.info({
                    message: messageWithContext('permissions received'),
                    id: payload.id,
                    permissionRows,
                });

                if (permissionRows.length === 0) {
                    throw new ActorError({
                        kind: EActorErrorKind.Authorization,
                        title: 'Draft update failed',
                        description: 'You do not have permission to update this draft',
                    });
                }

                const draft = {
                    dashboardId: payload.id,
                    config: payload.config,
                    digest: getDigest(payload.config),
                    user: username,
                };

                return isEmpty(payload.config) ? deleteDraft(draft) : upsertDraft(draft);
            }),
            map(() => {
                logger.info({
                    message: messageWithContext('draft upserted'),
                    id: payload.id,
                });

                return {};
            }),
            tap(() => metrics.drafts.updated.inc()),
        ),
    });
};
