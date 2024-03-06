import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { TContextRef } from '@frontend/common/src/di';
import { createActor } from '@frontend/common/src/utils/Actors';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { runAllEffects } from './effects';

export function createActorTradingStatsTab() {
    return createActor(EActorName.TradingStatsTab, async (actotrContext) => {
        const ctx = actotrContext as unknown as TContextRef;

        // Run initial effects
        await runAllEffects(ctx);

        const root = createRoot(document.getElementById('root')!);
        root.render(React.createElement(App, { context: ctx }));
    });
}
