import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import type { TContextRef } from '../../di';
import { ModuleTypicalRouter } from '../router';
import { ETypicalRoute } from '../router/defs.ts';

export const createModule = (ctx: TContextRef) => {
    const { state$ } = ModuleTypicalRouter(ctx);

    return {
        mock$: state$.pipe(
            map(
                (state) =>
                    (state.route.name !== ETypicalRoute.Default && state.route.params.mock) ??
                    false,
            ),
            distinctUntilChanged<boolean>(),
            shareReplay({ bufferSize: 1, refCount: true }),
        ),
    };
};
