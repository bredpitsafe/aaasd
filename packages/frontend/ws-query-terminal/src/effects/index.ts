import { EApplicationName } from '@common/types';
import { setupTabThread } from '@frontend/common/src/actors/utils/setupTabThread.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus';
import { initApplicationName } from '@frontend/common/src/effects/initApplicationName';
import { initHTTPStatusEffect } from '@frontend/common/src/effects/initHTTPStatusEffect';
import { initLayoutsEffects } from '@frontend/common/src/effects/layouts';
import { initSettingsEffects } from '@frontend/common/src/effects/settings';
import { initSocketServerTimeEffects } from '@frontend/common/src/effects/socketServerTime';

import { DEFAULT_LAYOUTS } from '../layouts';
import { initAppEffects } from './app';
import { routerEffects } from './router';
import { initSocketListEffects } from './socketList';

export async function runAllEffects(ctx: TContextRef): Promise<void> {
    initApplicationName(ctx, EApplicationName.WSQueryTerminal);

    routerEffects(ctx);
    initSocketListEffects(ctx);
    initSettingsEffects(ctx);

    initLayoutsEffects(ctx, DEFAULT_LAYOUTS);
    initHTTPStatusEffect(ctx);
    initActorDataSourceStatusEffects(ctx);
    initSocketServerTimeEffects(ctx);

    initAppEffects(ctx);
    setupTabThread(ctx);
}
