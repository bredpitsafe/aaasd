import type { TContextRef } from '@frontend/common/src/di';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';

export function initUIEffects(ctx: TContextRef): void {
    syncServerNameToPageTitle(ctx);
}

function syncServerNameToPageTitle(ctx: TContextRef): void {
    const { currentSocketName$ } = ModuleCommunication(ctx);

    currentSocketName$.subscribe((server) => {
        document.title = server ? `TST: ${server}` : 'Trading Stats';
    });
}
