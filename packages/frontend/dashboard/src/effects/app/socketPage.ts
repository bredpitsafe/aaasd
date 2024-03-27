import { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import { SOCKET_STAR_NAME } from '@frontend/common/src/modules/socketList/defs';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { first } from 'rxjs/operators';

export function initSocketPage(ctx: TContextRef) {
    const { getSocket$ } = ModuleSocketList(ctx);
    const { setCurrentSocket } = ModuleSocketPage(ctx);

    getSocket$(SOCKET_STAR_NAME)
        .pipe(first())
        .subscribe((url) => {
            setCurrentSocket(SOCKET_STAR_NAME, url);
        });
}
