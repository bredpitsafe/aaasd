import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';

export function initUIEffects(ctx: TContextRef): void {
    syncServerNameToPageTitle(ctx);
}

function syncServerNameToPageTitle(ctx: TContextRef): void {
    ModuleSocketPage(ctx).currentSocketName$.subscribe((server) => {
        document.title = server ? `BTM: ${server}` : 'Backtesting';
    });
}
