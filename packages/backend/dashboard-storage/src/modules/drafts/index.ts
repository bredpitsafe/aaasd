import { isEmpty } from 'lodash-es';
import { from, map, Observable, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import { deleteDraft, upsertDraft } from '../../db/drafts.ts';
import { getPermissions } from '../../db/permissions.ts';
import { getDigest } from '../../db/utils.ts';
import { EActorName, TActorRequest } from '../../def/actor.ts';
import { ResetDashboardDraftRequest, UpdateDashboardDraftRequest } from '../../def/request.ts';
import {
    Permission,
    ResetDashboardDraftResponse,
    UpdateDashboardDraftResponse,
} from '../../def/response.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { logger } from '../../utils/logger.ts';
import { metrics } from '../../utils/metrics.ts';

export function updateDashboardDraft(
    req: TActorRequest<UpdateDashboardDraftRequest>,
): Observable<UpdateDashboardDraftResponse> {
    const allowedLevels = [Permission.Owner, Permission.Editor];

    logger.info({
        message: '`updateDashboardDraft` - started',
        actor: EActorName.Drafts,
        traceId: req.traceId,
        correlationId: req.correlationId,
        id: req.payload.id,
    });

    return from(
        getPermissions({
            user: req.username!,
            id: req.payload.id,
            allowedLevels,
        }),
    ).pipe(
        switchMap(async (permissions) => {
            logger.info({
                message: '`updateDashboardDraft` - permissions received',
                actor: EActorName.Drafts,
                id: req.payload.id,
                traceId: req.traceId,
                correlationId: req.correlationId,
                permissions,
            });

            if (permissions.length === 0) {
                throw new ActorError({
                    kind: EActorErrorKind.Authorization,
                    title: 'Draft update failed',
                    description: 'You do not have permission to update this draft',
                });
            }

            const draft = {
                dashboardId: req.payload.id,
                config: req.payload.config,
                digest: getDigest(req.payload),
                user: req.username!,
            };

            return isEmpty(req.payload.config) ? deleteDraft(draft) : upsertDraft(draft);
        }),
        tap(() => {
            logger.info({
                message: '`updateDashboardDraft` - draft upserted',
                actor: EActorName.Drafts,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
            });
        }),
        map(() => {
            return { type: 'DashboardDraftUpdated' } as UpdateDashboardDraftResponse;
        }),
        tap(() => metrics.drafts.updated.inc()),
    );
}
export function resetDashboardDraft(
    req: TActorRequest<ResetDashboardDraftRequest>,
): Observable<ResetDashboardDraftResponse> {
    logger.info({
        message: '`resetDashboardDraft` - started',
        actor: EActorName.Drafts,
        traceId: req.traceId,
        correlationId: req.correlationId,
        id: req.payload.id,
    });

    return from(
        deleteDraft({
            dashboardId: req.payload.id,
            user: req.username!,
        }),
    ).pipe(
        tap(() => {
            logger.info({
                message: '`resetDashboardDraft` - draft reset',
                actor: EActorName.Drafts,
                traceId: req.traceId,
                correlationId: req.correlationId,
                id: req.payload.id,
            });
        }),
        map(() => {
            return { type: 'DashboardDraftReset' } as ResetDashboardDraftResponse;
        }),
        tap(() => metrics.drafts.reset.inc()),
    );
}
