import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { toContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus';
import { initContextUI } from '@frontend/common/src/effects/initContextUI';
import { initHTTPStatusEffect } from '@frontend/common/src/effects/initHTTPStatusEffect';
import { initAuthentication } from '@frontend/common/src/effects/keycloak';
import { initSettingsEffects } from '@frontend/common/src/effects/settings';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { initSocketServerTimeEffects } from '@frontend/common/src/effects/socketServerTime';
import { initTableStatesEffects } from '@frontend/common/src/effects/tables';
import { initWorkerEffects } from '@frontend/common/src/effects/worker';
import { EApplicationName } from '@frontend/common/src/types/app';
import { createActor } from '@frontend/common/src/utils/Actors';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { initAppEffects } from './effects/app';
import { routerEffects } from './effects/router';
import { initServiceStageListEffects } from './effects/serviceStage';
import { initUIEffects } from './effects/ui';

export function createActorDashboardsTab() {
    const root = createRoot(document.getElementById('root')!);

    return createActor(EActorName.DashboardTab, async (actorContext) => {
        const ctx = toContextRef(actorContext);

        root.render(createElement(LoadingOverlay, { text: 'Loading dashboards application...' }));

        initContextUI(ctx);
        initHTTPStatusEffect(ctx);

        void initSocketListEffects(ctx);
        void initAuthentication(ctx);
        void initServiceStageListEffects(ctx);

        initUIEffects(ctx);
        initActorDataSourceStatusEffects(ctx);
        initSocketServerTimeEffects(ctx);

        initAppEffects(ctx);
        initTableStatesEffects();
        initSettingsEffects(ctx, EApplicationName.Dashboard);

        routerEffects(ctx);
        initWorkerEffects(ctx);

        root.render(createElement(App, { context: ctx }));
    });
}
