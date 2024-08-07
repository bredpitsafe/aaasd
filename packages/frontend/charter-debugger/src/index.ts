import '@frontend/common/src/utils/Rx/internalProviders';

import { EActorName } from '@frontend/common/src/actors/Root/defs';
import { toContextRef } from '@frontend/common/src/di';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { createActor } from '@frontend/common/src/utils/Actors';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

function charterDebuggerActor() {
    return createActor(EActorName.CharterDebuggerTab, async (actorContext) => {
        const ctx = toContextRef(actorContext);

        void initSocketListEffects(ctx);

        const appRoot = createRoot(document.getElementById('root')!);
        appRoot.render(React.createElement(App, { ctx }));
    });
}

charterDebuggerActor().launch();
