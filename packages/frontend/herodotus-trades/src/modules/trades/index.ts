import { ModuleFactory } from '@frontend/common/src/di';
import { createObservableBox } from '@frontend/common/src/utils/rx';
import type { THerodotusTaskId, THerodotusTrade } from '@frontend/herodotus/src/types/domain';
import { map } from 'rxjs/operators';

function createModule() {
    const boxTrades = createObservableBox<Record<THerodotusTaskId, THerodotusTrade[]>>({});

    return {
        trades$: boxTrades.obs,
        getTrades$: (id: THerodotusTaskId) => boxTrades.obs.pipe(map((rec) => rec[id])),
        setTrades(id: THerodotusTaskId, trades: THerodotusTrade[]): void {
            boxTrades.set({
                ...boxTrades.get(),
                [id]: trades,
            });
        },
    };
}

export const ModuleHerodotusTrades = ModuleFactory(createModule);
