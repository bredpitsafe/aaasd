import { map } from 'rxjs/operators';

import { publishSocketServerTimeEnvBox } from '../actors/actions.ts';
import type { TContextRef } from '../di';
import { ModuleActor } from '../modules/actor';
import { ModuleSocketServerTime } from '../modules/socketServerTime';

export function initSocketServerTimeEffects(ctx: TContextRef) {
    const actor = ModuleActor(ctx);
    const { upsertServerTimeMap } = ModuleSocketServerTime(ctx);

    publishSocketServerTimeEnvBox
        .as$(actor)
        .pipe(map((env) => env.payload))
        .subscribe(upsertServerTimeMap);
}
