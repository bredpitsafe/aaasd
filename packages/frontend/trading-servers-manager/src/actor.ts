import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { createActor } from '@frontend/common/src/utils/Actors';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { toContextRef } from '../../common/src/di';
import { App } from './App';
import { runAllEffects } from './effects';

export function createActorTradingServerManagerTab() {
    return createActor(EActorName.TradingServerManagerTab, async (contextActor) => {
        const ctx = toContextRef(contextActor);

        // Run initial effects
        await runAllEffects(ctx);

        const root = createRoot(document.getElementById('root')!);
        root.render(React.createElement(App, { context: ctx }));
    });
}
