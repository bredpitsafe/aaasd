import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay.tsx';
import { toContextRef } from '@frontend/common/src/di';
import { createActor } from '@frontend/common/src/utils/Actors';
import React, { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { runAllEffects } from './effects';

export function createActorBalanceMonitorTab() {
    return createActor(EActorName.BalanceMonitorTab, async (actorContext) => {
        const ctx = toContextRef(actorContext);

        const root = createRoot(document.getElementById('root')!);
        root.render(createElement(LoadingOverlay, { text: 'Initializing application...' }));

        await runAllEffects(ctx);
        root.render(React.createElement(App, { context: ctx }));
    });
}
