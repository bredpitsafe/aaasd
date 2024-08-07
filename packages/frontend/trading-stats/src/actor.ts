import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay.tsx';
import type { TContextRef } from '@frontend/common/src/di';
import { createActor } from '@frontend/common/src/utils/Actors';
import React, { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { runAllEffects } from './effects';

export function createActorTradingStatsTab() {
    return createActor(EActorName.TradingStatsTab, async (actotrContext) => {
        const ctx = actotrContext as unknown as TContextRef;

        const root = createRoot(document.getElementById('root')!);
        root.render(createElement(LoadingOverlay, { text: 'Initializing application...' }));

        await runAllEffects(ctx);
        root.render(React.createElement(App, { context: ctx }));
    });
}
