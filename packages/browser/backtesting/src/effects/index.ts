import { TContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus';
import { initTableFiltersEffects } from '@frontend/common/src/effects/filters';
import { initContextUI } from '@frontend/common/src/effects/initContextUI';
import { initHTTPStatusEffect } from '@frontend/common/src/effects/initHTTPStatusEffect';
import { initAuthentication } from '@frontend/common/src/effects/keycloak';
import { initLayoutsEffects } from '@frontend/common/src/effects/layouts';
import { syncRouterWithSocket } from '@frontend/common/src/effects/router';
import { initSettingsEffects } from '@frontend/common/src/effects/settings';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { initTableStatesEffects } from '@frontend/common/src/effects/tables';
import { initWorkerEffects } from '@frontend/common/src/effects/worker';
import { EApplicationName } from '@frontend/common/src/types/app';

import { DEFAULT_LAYOUTS } from '../layouts';
import { ModuleBacktestingRouter } from '../modules/router/module';
import { initAppEffects } from './app';
import { initUIEffects } from './ui';

export async function initAllEffects(ctx: TContextRef) {
    initContextUI(ctx);

    ModuleBacktestingRouter(ctx).router.start();

    void initTableFiltersEffects(ctx);
    void initSocketListEffects(ctx);
    void initAuthentication(ctx);

    syncRouterWithSocket(ctx);
    initHTTPStatusEffect(ctx);
    initActorDataSourceStatusEffects(ctx);

    initTableStatesEffects();
    initLayoutsEffects(ctx, DEFAULT_LAYOUTS, EApplicationName.BacktestingManager);

    initAppEffects(ctx);
    initUIEffects(ctx);
    initSettingsEffects(ctx, EApplicationName.BacktestingManager);
    initWorkerEffects(ctx);
}
