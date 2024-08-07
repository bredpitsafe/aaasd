import type { UnaryRpc } from '@backend/grpc/src/types/rpc-types.ts';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';
import type {
    TSubmitDashboardDraftConfigRequest,
    TSubmitDashboardDraftConfigResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/draft_api.js';
import { isNil } from 'lodash-es';
import { from, map, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import { getDashboardById, upsertDashboard } from '../../db/dashboards.ts';
import { deleteDraft } from '../../db/drafts.ts';
import { getPermissions } from '../../db/permissions.ts';
import { getDigest } from '../../db/utils.ts';
import { EActorName } from '../../def/actor.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { handleUnaryRpcInitialization } from '../handlers/handleUnaryRpcInitialization.ts';

export const submitDashboardDraftConfig: UnaryRpc<
    TSubmitDashboardDraftConfigRequest,
    TSubmitDashboardDraftConfigResponse
> = function submitDashboardDraftConfig(call, callback) {
    const { logger, messageWithContext, username, payload, logStart, handle$ } =
        handleUnaryRpcInitialization({
            rpc: submitDashboardDraftConfig,
            call,
            callback,
            actor: EActorName.Dashboards,
        });

    logStart({ id: payload.id });

    const allowedLevels: TPermission[] = ['PERMISSION_OWNER', 'PERMISSION_EDITOR'];

    handle$({
        obs$: from(
            getPermissions({
                user: username,
                id: payload.id,
                allowedLevels,
            }),
        ).pipe(
            switchMap((permissionRows) => {
                logger.info({
                    message: messageWithContext('permissions received'),
                    id: payload.id,
                    permissionRows,
                });

                if (permissionRows.length === 0) {
                    throw new ActorError({
                        kind: EActorErrorKind.Authorization,
                        title: 'Dashboard update failed',
                        description: 'You do not have permission to edit this dashboard',
                    });
                }

                // Check whether old and new digests match.
                // If not, the user is trying to update an outdated config.
                // Such operation must be denied.
                return getDashboardById(payload.id);
            }),
            switchMap((currentDashboard) => {
                if (isNil(currentDashboard)) {
                    throw new ActorError({
                        kind: EActorErrorKind.NotFound,
                        title: 'Dashboard not found',
                        description: 'Dashboard may have been deleted from storage by the owner',
                    });
                }

                if (currentDashboard.digest !== payload.previousDigest) {
                    throw new ActorError({
                        kind: EActorErrorKind.Validation,
                        title: 'Dashboard update failed',
                        description:
                            'Digest mismatch. You are trying to update an outdated dashboard.',
                        args: {
                            currentDigest: currentDashboard.digest,
                            receivedDigest: payload.previousDigest,
                        },
                    });
                }

                const newDigest = getDigest(payload.config);

                if (newDigest === payload.previousDigest) {
                    logger.info({
                        message: messageWithContext('same digest detected, skipping update'),
                        id: payload.id,
                    });

                    return of(currentDashboard.id);
                }

                logger.info({
                    message: messageWithContext('digests checked, upserting dashboard'),
                    id: payload.id,
                });

                return upsertDashboard({
                    id: payload.id,
                    name: currentDashboard.name,
                    config: payload.config,
                    status: currentDashboard.status,
                });
            }),
            switchMap((dashboardId) => {
                // Reset draft after updating a dashboard config
                logger.info({
                    message: messageWithContext('dashboard updated, resetting draft'),
                    id: payload.id,
                });

                return deleteDraft({
                    dashboardId,
                    user: username,
                });
            }),
            tap(() => {
                logger.info({
                    message: messageWithContext('draft reset, finishing'),
                    id: payload.id,
                });
            }),
            map(() => ({})),
        ),
    });
};
