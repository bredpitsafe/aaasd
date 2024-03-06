import type { TContextRef } from '@frontend/common/src/di';

import { initSocketPage } from './socketPage';

export function initAppEffects(ctx: TContextRef) {
    initSocketPage(ctx);
}
