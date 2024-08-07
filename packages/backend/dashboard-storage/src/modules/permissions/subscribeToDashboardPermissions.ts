import type { ServerStreamingRpc } from '@backend/grpc/src/types/rpc-types.ts';
import { shortenLoggingArray } from '@common/utils';
import type {
    TSubscribeToDashboardPermissionsRequest,
    TSubscribeToDashboardPermissionsResponse,
} from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/sharing_api.js';
import { from, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
    subscribeToDashboardPermissionsUpdates,
    subscribeToPermissionsUpdates,
} from '../../db/permissions.ts';
import { EActorName } from '../../def/actor.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { handleSubscriptionRpcInitialization } from '../handlers/handleSubscriptionRpcInitialization.ts';

export const subscribeToDashboardPermissions: ServerStreamingRpc<
    TSubscribeToDashboardPermissionsRequest,
    TSubscribeToDashboardPermissionsResponse
> = function subscribeToDashboardPermissions(call) {
    const {
        logger,
        messageWithContext,
        username,
        logStart,
        payload,
        takeUntilChannelClose,
        handleResponse,
        handleError,
        handleComplete,
    } = handleSubscriptionRpcInitialization({
        rpc: subscribeToDashboardPermissions,
        call,
        metadata: call.metadata,
        actor: EActorName.Permissions,
    });

    logStart(payload);

    try {
        from(
            // Check that only the owner can access this dashboard's permissions
            subscribeToPermissionsUpdates({
                user: username,
                id: payload.id,
                allowedLevels: ['PERMISSION_OWNER'],
            }),
        )
            .pipe(
                switchMap((permissions) => {
                    logger.info({
                        message: messageWithContext('owner permissions received'),
                        id: payload.id,
                        permissions,
                    });

                    if (permissions.length === 0) {
                        throw new ActorError({
                            kind: EActorErrorKind.Authorization,
                            title: 'Getting dashboard permissions failed',
                            description:
                                'You do not have permission to list permissions for this dashboard',
                        });
                    }
                    // After that, subscribe to all permissions for this dashboard
                    return subscribeToDashboardPermissionsUpdates({
                        id: payload.id,
                        user: username,
                    });
                }),
                tap((permissionRows) => {
                    logger.info({
                        message: messageWithContext('all permissions received'),
                        id: payload.id,
                        permissionRows,
                    });
                }),
                takeUntilChannelClose(),
            )
            .subscribe({
                next: (list) => {
                    call.write({ list });

                    handleResponse({ list: shortenLoggingArray(list) });
                },
                error: (error) => {
                    throw error;
                },
                complete: () => {
                    handleComplete();
                },
            });
    } catch (error) {
        handleError(error);
    }
};
