import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';

export function initAppEffects(ctx: TContextRef): void {
    syncServerNameToPageTitle(ctx);
}

function syncServerNameToPageTitle(ctx: TContextRef): void {
    const { currentSocketName$ } = ModuleSocketPage(ctx);

    currentSocketName$.subscribe((server) => {
        document.title = server ? `WSQT: ${server}` : 'WS Query Terminal';
    });
}
