import { map } from 'rxjs/operators';

import { publishDataSourceStateEnvBox } from '../actors/actions.ts';
import type { TContextRef } from '../di';
import { ModuleActor } from '../modules/actor';
import { ModuleDataSourceStatus } from '../modules/dataSourceStatus/module';
import { isWindow } from '../utils/detect.ts';

export function initActorDataSourceStatusEffects(ctx: TContextRef) {
    const actor = ModuleActor(ctx);
    const { upsertDataSources } = ModuleDataSourceStatus(ctx);

    // If the current actor is initialized in tab context, there's no need to sync data sources
    // (it'll cause an execution loop and hang the page)
    if (isWindow) {
        return;
    }

    publishDataSourceStateEnvBox
        .as$(actor)
        .pipe(map((env) => env.payload))
        .subscribe(upsertDataSources);
}
