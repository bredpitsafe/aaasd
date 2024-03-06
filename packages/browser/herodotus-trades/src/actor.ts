import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { toContextRef } from '@frontend/common/src/di';
import { createActor } from '@frontend/common/src/utils/Actors';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { initEffects } from './effects';

export function createActorHerodotusTradesTab() {
    return createActor(EActorName.HerodotusTradesTab, async (actorContext) => {
        const ctx = toContextRef(actorContext);

        await initEffects(ctx);

        const root = createRoot(document.getElementById('root')!);
        root.render(React.createElement(App, { context: ctx }));
    });
}
