import type { TContextRef } from '@frontend/common/src/di';

import { ModuleAuthzRouter } from '../modules/router/module';

export function routerEffects(ctx: TContextRef): void {
    initViewRouter(ctx);
}

function initViewRouter(ctx: TContextRef): void {
    const { router } = ModuleAuthzRouter(ctx);

    router.start();
}
