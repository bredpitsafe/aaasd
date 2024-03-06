import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { toContextRef } from '@frontend/common/src/di';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import { createActor } from '@frontend/common/src/utils/Actors';
import { BehaviorSubject } from 'rxjs';

import { initServiceStageListEffects } from '../../effects/serviceStage';
import { createDashboardsListSubscriptionFactory } from './actions/dashboardsStorage/createDashboardsListSubscriptionFactory';
import { createDashboardSubscriptionFactory } from './actions/dashboardsStorage/createDashboardSubscriptionFactory';
import { fetchDashboardConfigFactory } from './actions/dashboardsStorage/fetchDashboardConfigFactory';
import { fetchDashboardDraftFactory } from './actions/dashboardsStorage/fetchDashboardDraftFactory';
import { dashboardCreationEffect } from './effects/dashboardCreationEffect';
import { dashboardDraftResetEffect } from './effects/dashboardDraftResetEffect';
import { dashboardDraftUpdateEffect } from './effects/dashboardDraftUpdateEffect';
import { dashboardEffect } from './effects/dashboardEffect';
import { dashboardIdByLegacyIdFetcherEffect } from './effects/dashboardIdByLegacyIdFetcherEffect';
import { dashboardPermissionsEffect } from './effects/dashboardPermissionsEffect';
import { dashboardPermissionsUpdateEffect } from './effects/dashboardPermissionsUpdateEffect';
import { dashboardRemovalEffect } from './effects/dashboardRemovalEffect';
import { dashboardRenameEffect } from './effects/dashboardRenameEffect';
import { dashboardShareSettingsUpdateEffect } from './effects/dashboardShareSettingsUpdateEffect';
import { dashboardsListEffect } from './effects/dashboardsListEffect';
import { dashboardsLoadStateEffect } from './effects/dashboardsLoadStateEffect';
import { dashboardUpdateEffect } from './effects/dashboardUpdateEffect';
import { dashboardUpdateProgressEffect } from './effects/dashboardUpdateProgressEffect';
import { dashboardUsersEffect } from './effects/dashboardUsersEffect';
import { externalDashboardRegistrationEffect } from './effects/externalDashboardRegistrationEffect';
import { DashboardsMemoryCache } from './effects/utils/DashboardsMemoryCache';
import { UpdateProgress } from './effects/utils/UpdateProgress';
import { UpdatesChecker } from './effects/utils/UpdatesChecker';

export function createActorFullDashboards() {
    const updateProgressSubject = new BehaviorSubject(UpdateProgress.create());
    const memoryDashboardsSubject = new BehaviorSubject(DashboardsMemoryCache.create());
    const memoryOriginalDashboardsSubject = new BehaviorSubject(DashboardsMemoryCache.create());
    const updatesChecker = new UpdatesChecker();

    return createActor(EActorName.FullDashboards, (actorContext) => {
        const ctx = toContextRef(actorContext);

        initSocketListEffects(ctx);

        const { socketNames$ } = ModuleSocketList(ctx);
        const getDashboardsList$ = createDashboardsListSubscriptionFactory(ctx);
        const getDashboard$ = createDashboardSubscriptionFactory(ctx);
        const fetchDashboard$ = fetchDashboardConfigFactory(ctx);
        const fetchDashboardDraft$ = fetchDashboardDraftFactory(ctx);

        dashboardsLoadStateEffect(actorContext, socketNames$);

        void initServiceStageListEffects(ctx);

        dashboardsListEffect(
            actorContext,
            updatesChecker,
            memoryDashboardsSubject,
            memoryOriginalDashboardsSubject,
            getDashboardsList$,
        );

        dashboardEffect(
            actorContext,
            updatesChecker,
            memoryDashboardsSubject,
            getDashboard$,
            fetchDashboard$,
            fetchDashboardDraft$,
        );

        externalDashboardRegistrationEffect(
            ctx,
            actorContext,
            memoryDashboardsSubject,
            memoryOriginalDashboardsSubject,
        );

        dashboardCreationEffect(ctx, actorContext);

        dashboardUpdateEffect(
            ctx,
            actorContext,
            memoryDashboardsSubject,
            memoryOriginalDashboardsSubject,
            updateProgressSubject,
            updatesChecker,
        );

        dashboardDraftUpdateEffect(ctx, actorContext, memoryDashboardsSubject, updatesChecker);

        dashboardUpdateProgressEffect(actorContext, updateProgressSubject.asObservable());

        dashboardRemovalEffect(
            ctx,
            actorContext,
            memoryDashboardsSubject,
            updateProgressSubject,
            updatesChecker,
        );

        dashboardDraftResetEffect(
            ctx,
            actorContext,
            memoryDashboardsSubject,
            memoryOriginalDashboardsSubject,
            updateProgressSubject,
        );

        dashboardShareSettingsUpdateEffect(ctx, actorContext);

        dashboardIdByLegacyIdFetcherEffect(ctx, actorContext);

        dashboardPermissionsEffect(ctx, actorContext);

        dashboardPermissionsUpdateEffect(ctx, actorContext);

        dashboardUsersEffect(ctx, actorContext);

        dashboardRenameEffect(
            ctx,
            actorContext,
            updatesChecker,
            memoryDashboardsSubject,
            getDashboard$,
            updateProgressSubject,
            fetchDashboard$,
            fetchDashboardDraft$,
        );
    });
}
