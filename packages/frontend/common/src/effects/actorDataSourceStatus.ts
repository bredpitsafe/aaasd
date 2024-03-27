import { map } from 'rxjs/operators';

import { publishDataSourceStateEnvBox } from '../actors/Handlers/actions';
import { TContextRef } from '../di';
import { ModuleActor } from '../modules/actor';
import { ModuleDataSourceStatus } from '../modules/dataSourceStatus/module';

export function initActorDataSourceStatusEffects(ctx: TContextRef) {
    const actor = ModuleActor(ctx);
    const { upsertDataSources } = ModuleDataSourceStatus(ctx);

    publishDataSourceStateEnvBox
        .as$(actor)
        .pipe(map((env) => env.payload))
        .subscribe(upsertDataSources);
}
