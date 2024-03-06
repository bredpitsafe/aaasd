import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { toContextRef } from '@frontend/common/src/di';
import { createActor } from '@frontend/common/src/utils/Actors';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { runAllEffects } from './effects';

export function createActorHerodotusTerminalTab() {
    return createActor(EActorName.HerodotusTerminalTab, async (actorContext) => {
        const ctx = toContextRef(actorContext);

        await runAllEffects(ctx);

        const root = createRoot(document.getElementById('root')!);
        root.render(React.createElement(App, { context: ctx }));
    });
}
