import { isUndefined } from 'lodash-es';
import { combineLatest, distinctUntilChanged, EMPTY, of, shareReplay, switchMap } from 'rxjs';

import type { TContextRef } from '../../di';
import { ModuleSocketList } from '../socketList';
import { getRouterSocketName$ } from './getRouterSocketName$';

export function getRouterSocket$(ctx: TContextRef) {
    const { getSocket$ } = ModuleSocketList(ctx);

    return getRouterSocketName$(ctx).pipe(
        switchMap((socketName) => {
            return isUndefined(socketName)
                ? EMPTY
                : combineLatest({
                      name: of(socketName),
                      url: getSocket$(socketName),
                  });
        }),
        distinctUntilChanged((a, b) => {
            return a.name === b.name && a.url === b.url;
        }),
        shareReplay(1),
    );
}
