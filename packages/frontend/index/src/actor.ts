import { EActorName } from '@frontend/common/src/actors/Root/defs.ts';
import { toContextRef } from '@frontend/common/src/di';
import { createActor } from '@frontend/common/src/utils/Actors';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';
import { runAllEffects } from './effects';

export function createActorIndexTab() {
    return createActor(EActorName.IndexTab, async (actorContext) => {
        const ctx = toContextRef(actorContext);
        runAllEffects(ctx);

        const root = createRoot(document.getElementById('root')!);
        root.render(React.createElement(App, { context: ctx }));
    });
}
