import { EApplicationName } from '@common/types';
import { setupTabThread } from '@frontend/common/src/actors/utils/setupTabThread.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { initApplicationName } from '@frontend/common/src/effects/initApplicationName';
import { initSettingsEffects } from '@frontend/common/src/effects/settings.ts';

export function runAllEffects(ctx: TContextRef) {
    initApplicationName(ctx, EApplicationName.Index);

    initSettingsEffects(ctx);
    setupTabThread(ctx);
}
