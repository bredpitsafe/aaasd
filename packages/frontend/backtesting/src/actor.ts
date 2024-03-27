import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { toContextRef } from '@frontend/common/src/di';
import { createActor } from '@frontend/common/src/utils/Actors';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { initAllEffects } from './effects';

export function createActorBacktestingTab() {
    return createActor(EActorName.BacktestingTab, async (actorContext) => {
        const ctx = toContextRef(actorContext);

        initAllEffects(ctx);

        const root = createRoot(document.getElementById('root')!);
        root.render(createElement(App, { context: ctx }));
    });
}
