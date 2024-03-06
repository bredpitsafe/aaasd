import type { TContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus';
import { initContextUI } from '@frontend/common/src/effects/initContextUI';
import { initHTTPStatusEffect } from '@frontend/common/src/effects/initHTTPStatusEffect';
import { initAuthentication } from '@frontend/common/src/effects/keycloak';
import { initLayoutsEffects } from '@frontend/common/src/effects/layouts';
import { initSettingsEffects } from '@frontend/common/src/effects/settings';
import { initSocketServerTimeEffects } from '@frontend/common/src/effects/socketServerTime';
import { initWorkerEffects } from '@frontend/common/src/effects/worker';
import { EApplicationName } from '@frontend/common/src/types/app';

import { DEFAULT_LAYOUTS } from '../layouts';
import { initAppEffects } from './app';
import { routerEffects } from './router';
import { initSocketListEffects } from './socketList';

export async function runAllEffects(ctx: TContextRef): Promise<void> {
    initContextUI(ctx);
    initSocketListEffects(ctx);
    initAuthentication(ctx);
    routerEffects(ctx);

    initLayoutsEffects(ctx, DEFAULT_LAYOUTS, EApplicationName.WSQueryTerminal);
    initHTTPStatusEffect(ctx);
    initActorDataSourceStatusEffects(ctx);
    initSocketServerTimeEffects(ctx);
    initSettingsEffects(ctx, EApplicationName.WSQueryTerminal);
    initWorkerEffects(ctx);

    initAppEffects(ctx);
}
