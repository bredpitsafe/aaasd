import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay.tsx';
import { createActor } from '@frontend/common/src/utils/Actors';
import React, { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { toContextRef } from '../../common/src/di';
import { App } from './App';
import { runAllEffects } from './effects';

export function createActorTradingServerManagerTab() {
    return createActor(EActorName.TradingServerManagerTab, async (contextActor) => {
        const ctx = toContextRef(contextActor);

        const root = createRoot(document.getElementById('root')!);
        root.render(createElement(LoadingOverlay, { text: 'Initializing application...' }));

        await runAllEffects(ctx);
        root.render(React.createElement(App, { context: ctx }));
    });
}
