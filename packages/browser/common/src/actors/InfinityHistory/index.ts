import { TContextRef } from '../../di';
import { createActor } from '../../utils/Actors';
import { EActorName } from '../Root/defs';
import { initBacktestingTasksEffects } from './src/effects/backtestingTasks';
import { initIndicatorsEffects } from './src/effects/indicators';
import { initOwnTradesEffects } from './src/effects/ownTrades';
import { initProductLogsEffects } from './src/effects/productLogs';

export function createActorInfinityHistory() {
    return createActor(EActorName.SnapshotsAndHistory, (context) => {
        const ctx = context as unknown as TContextRef;

        initOwnTradesEffects(ctx);
        initIndicatorsEffects(ctx);
        initProductLogsEffects(ctx);
        initBacktestingTasksEffects(ctx);
    });
}
