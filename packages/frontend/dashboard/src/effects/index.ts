import { EApplicationName } from '@common/types';
import { setupTabThread } from '@frontend/common/src/actors/utils/setupTabThread.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus.ts';
import { initApplicationName } from '@frontend/common/src/effects/initApplicationName.ts';
import { initHTTPStatusEffect } from '@frontend/common/src/effects/initHTTPStatusEffect.ts';
import { initSettingsEffects } from '@frontend/common/src/effects/settings.ts';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList.ts';
import { initSocketServerTimeEffects } from '@frontend/common/src/effects/socketServerTime.ts';
import { initTableStatesEffects } from '@frontend/common/src/effects/tables';

import { routerEffects } from './router.ts';
import { initServiceStageListEffects } from './serviceStage.ts';
import { initUIEffects } from './ui.ts';

export async function runAllEffects(ctx: TContextRef): Promise<void> {
    initApplicationName(ctx, EApplicationName.Dashboard);
    initHTTPStatusEffect(ctx);

    initSettingsEffects(ctx);

    void initSocketListEffects(ctx);
    void initServiceStageListEffects(ctx);

    initUIEffects(ctx);
    initActorDataSourceStatusEffects(ctx);
    initSocketServerTimeEffects(ctx);

    initTableStatesEffects();
    initSettingsEffects(ctx);

    routerEffects(ctx);
    setupTabThread(ctx);
}
