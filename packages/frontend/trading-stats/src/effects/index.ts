import { TContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus';
import { initTableFiltersEffects } from '@frontend/common/src/effects/filters';
import { initContextUI } from '@frontend/common/src/effects/initContextUI';
import { initHTTPStatusEffect } from '@frontend/common/src/effects/initHTTPStatusEffect';
import { initAuthentication } from '@frontend/common/src/effects/keycloak';
import { initLayoutsEffects } from '@frontend/common/src/effects/layouts';
import { initSettingsEffects } from '@frontend/common/src/effects/settings';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { initSocketServerTimeEffects } from '@frontend/common/src/effects/socketServerTime';
import { initTableStatesEffects } from '@frontend/common/src/effects/tables';
import { initWorkerEffects } from '@frontend/common/src/effects/worker';
import { EApplicationName } from '@frontend/common/src/types/app';

import { DEFAULT_LAYOUTS } from '../layouts';
import { routerEffects } from './router';
import { initUIEffects } from './ui';

export async function runAllEffects(ctx: TContextRef): Promise<void> {
    initContextUI(ctx);

    void initSocketListEffects(ctx);
    void initAuthentication(ctx);

    initHTTPStatusEffect(ctx);
    initTableStatesEffects();
    initActorDataSourceStatusEffects(ctx);
    initSocketServerTimeEffects(ctx);
    initLayoutsEffects(ctx, DEFAULT_LAYOUTS, EApplicationName.TradingStats);
    initUIEffects(ctx);
    initSettingsEffects(ctx, EApplicationName.TradingStats);

    void initTableFiltersEffects(ctx);

    routerEffects(ctx);
    initWorkerEffects(ctx);
}
