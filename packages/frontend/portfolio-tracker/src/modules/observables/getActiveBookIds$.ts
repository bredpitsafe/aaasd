import { TContextRef } from '@frontend/common/src/di';
import { extractRouterParam } from '@frontend/common/src/modules/router/utils';
import { distinctUntilChanged, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';

import { EPortfolioTrackerSearchParams } from '../router/def';
import { ModulePortfolioTrackerRouter } from '../router/module';

export function getActiveBookIds$(ctx: TContextRef) {
    const { state$ } = ModulePortfolioTrackerRouter(ctx);

    return state$.pipe(
        map(({ route }) => extractRouterParam(route, EPortfolioTrackerSearchParams.ActiveBooks)),
        distinctUntilChanged((a, b) => a?.join('') === b?.join('')),
        shareReplay(1),
    );
}
