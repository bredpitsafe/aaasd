import { distinctUntilChanged, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TContextRef } from '../../di';
import { ModuleTypicalRouter } from '../router';
import { ETypicalSearchParams } from '../router/defs';
import { extractRouterParam } from '../router/utils';

export function getRouterSocketName$(ctx: TContextRef) {
    const { state$ } = ModuleTypicalRouter(ctx);

    return state$.pipe(
        map(({ route }) => extractRouterParam(route, ETypicalSearchParams.Socket)),
        distinctUntilChanged(),
        shareReplay(1),
    );
}
