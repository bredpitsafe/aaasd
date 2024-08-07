import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { toContextRef } from '@frontend/common/src/di';
import { createActor } from '@frontend/common/src/utils/Actors';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { runAllEffects } from './effects';

export function createActorDashboardsTab() {
    const root = createRoot(document.getElementById('root')!);

    return createActor(EActorName.DashboardTab, async (actorContext) => {
        const ctx = toContextRef(actorContext);

        root.render(createElement(LoadingOverlay, { text: 'Loading dashboards application...' }));
        await runAllEffects(ctx);
        root.render(createElement(App, { context: ctx }));
    });
}
