import type { TContextRef } from '@frontend/common/src/di';
import { getRouterSocket$ } from '@frontend/common/src/modules/observables/getRouterSocket$';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';

export function initAppEffects(ctx: TContextRef): void {
    syncServerNameToPageTitle(ctx);
    syncUrlToSocketPage(ctx);
}

function syncServerNameToPageTitle(ctx: TContextRef): void {
    const { currentSocketName$ } = ModuleSocketPage(ctx);

    currentSocketName$.subscribe((server) => {
        document.title = server ? `BM: ${server}` : 'Balance Monitor';
    });
}

function syncUrlToSocketPage(ctx: TContextRef): void {
    const { setCurrentSocket } = ModuleSocketPage(ctx);

    getRouterSocket$(ctx).subscribe(({ name, url }) => {
        setCurrentSocket(name, url);
    });
}
