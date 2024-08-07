import { EApplicationName } from '@common/types';
import { setupTabThread } from '@frontend/common/src/actors/utils/setupTabThread.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus';
import { initTableFiltersEffects } from '@frontend/common/src/effects/filters';
import { initApplicationName } from '@frontend/common/src/effects/initApplicationName';
import { initHTTPStatusEffect } from '@frontend/common/src/effects/initHTTPStatusEffect';
import { initLayoutsEffects } from '@frontend/common/src/effects/layouts';
import { initSettingsEffects } from '@frontend/common/src/effects/settings';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { initSocketServerTimeEffects } from '@frontend/common/src/effects/socketServerTime';
import { initTableStatesEffects } from '@frontend/common/src/effects/tables';

import { DEFAULT_LAYOUTS } from '../layouts';
import { routerEffects } from './router';

export function runAllEffects(ctx: TContextRef) {
    initApplicationName(ctx, EApplicationName.Authz);

    void initSocketListEffects(ctx);

    initHTTPStatusEffect(ctx);
    initTableStatesEffects();
    initActorDataSourceStatusEffects(ctx);
    initSocketServerTimeEffects(ctx);
    initSettingsEffects(ctx);
    initLayoutsEffects(ctx, DEFAULT_LAYOUTS);

    void initTableFiltersEffects(ctx);

    routerEffects(ctx);
    setupTabThread(ctx);
}
