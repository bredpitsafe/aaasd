import { EApplicationName } from '@common/types';
import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { toContextRef } from '@frontend/common/src/di';
import { initApplicationName } from '@frontend/common/src/effects/initApplicationName';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import { createActor } from '@frontend/common/src/utils/Actors';
import { BehaviorSubject } from 'rxjs';

import { initServiceStageListEffects } from '../../effects/serviceStage';
import { dashboardDraftResetEffect } from './effects/dashboardDraftResetEffect';
import { dashboardDraftUpdateEffect } from './effects/dashboardDraftUpdateEffect';
import { dashboardEffect } from './effects/dashboardEffect';
import { dashboardRemovalEffect } from './effects/dashboardRemovalEffect';
import { dashboardRenameEffect } from './effects/dashboardRenameEffect';
import { dashboardsListEffect } from './effects/dashboardsListEffect';
import { dashboardsLoadStateEffect } from './effects/dashboardsLoadStateEffect';
import { dashboardUpdateBindingEffect } from './effects/dashboardUpdateBindingEffect';
import { dashboardUpdateEffect } from './effects/dashboardUpdateEffect';
import { dashboardUpdateProgressEffect } from './effects/dashboardUpdateProgressEffect';
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
        initApplicationName(ctx, EApplicationName.Dashboard);
        initSocketListEffects(ctx);

        const { socketNames$ } = ModuleSocketList(ctx);

        dashboardsLoadStateEffect(ctx, socketNames$);

        void initServiceStageListEffects(ctx);

        dashboardsListEffect(
            ctx,
            updatesChecker,
            memoryDashboardsSubject,
            memoryOriginalDashboardsSubject,
        );

        dashboardEffect(
            ctx,
            updatesChecker,
            memoryDashboardsSubject,
            memoryOriginalDashboardsSubject,
        );

        dashboardUpdateEffect(
            ctx,
            memoryDashboardsSubject,
            memoryOriginalDashboardsSubject,
            updateProgressSubject,
            updatesChecker,
        );

        dashboardDraftUpdateEffect(ctx, memoryDashboardsSubject, updatesChecker);

        dashboardUpdateProgressEffect(ctx, updateProgressSubject.asObservable());

        dashboardRemovalEffect(ctx, memoryDashboardsSubject, updateProgressSubject, updatesChecker);

        dashboardDraftResetEffect(
            ctx,
            memoryDashboardsSubject,
            memoryOriginalDashboardsSubject,
            updateProgressSubject,
        );

        dashboardRenameEffect(ctx, updatesChecker, memoryDashboardsSubject, updateProgressSubject);

        dashboardUpdateBindingEffect(ctx, memoryDashboardsSubject);
    });
}
