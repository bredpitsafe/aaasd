import { EApplicationName } from '@common/types';
import type { TContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus';
import { initTableFiltersEffects } from '@frontend/common/src/effects/filters';
import { initApplicationName } from '@frontend/common/src/effects/initApplicationName';
import { initHTTPStatusEffect } from '@frontend/common/src/effects/initHTTPStatusEffect';
import { initLayoutsEffects } from '@frontend/common/src/effects/layouts';
import { syncRouterWithSocket } from '@frontend/common/src/effects/router';
import { initSettingsEffects } from '@frontend/common/src/effects/settings';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { initTableStatesEffects } from '@frontend/common/src/effects/tables';

import { DEFAULT_LAYOUTS } from '../layouts';
import { ModuleBacktestingRouter } from '../modules/router/module';
import { initAppEffects } from './app';
import { initFormDraftEffects } from './formHasDraft';
import { initUIEffects } from './ui';

export async function initAllEffects(ctx: TContextRef) {
    initApplicationName(ctx, EApplicationName.BacktestingManager);

    ModuleBacktestingRouter(ctx).router.start();

    void initTableFiltersEffects(ctx);
    void initSocketListEffects(ctx);

    syncRouterWithSocket(ctx);
    initHTTPStatusEffect(ctx);
    initActorDataSourceStatusEffects(ctx);

    initSettingsEffects(ctx);
    initTableStatesEffects();
    initLayoutsEffects(ctx, DEFAULT_LAYOUTS);
    initFormDraftEffects(ctx);

    initAppEffects(ctx);
    initUIEffects(ctx);
}
