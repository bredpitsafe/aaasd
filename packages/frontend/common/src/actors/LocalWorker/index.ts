// minimal setup for shared worker for logging to the server
import { once } from 'lodash-es';

import { createActorBacktestingDataProviders } from '../BacktestingDataProviders';
import { createActorChartsDataProvider } from '../ChartsDataProvider';
import { createActorComponentsDataProvider } from '../ComponentsDataProvider';
import { createActorDictionaries } from '../Dictionaries';
import { createActorHerodotusTasks } from '../HerodotusTasks';
import { createIndicatorsDataProvider } from '../IndicatorsDataProvider';
import { createActorInfinityHistory } from '../InfinityHistory';
import { createActorKeycloak } from '../Keycloak';
import { createActorMetrics } from '../Metrics';
import { createActorRoot } from '../Root';
import { createActorSession } from '../Session';
import { createActorSettings } from '../Settings';
import { createTradingServersManagerDataProvider } from '../TradingServersManager';

export function createLocalWorkerActor() {
    const root = createActorRoot();

    const initActors = once(() => {
        const actors = [
            createActorKeycloak(),
            createActorSession(),
            createActorMetrics(),
            createActorSettings(),
            createActorDictionaries(),
            createActorInfinityHistory(),
            createIndicatorsDataProvider(),
            createActorChartsDataProvider(),
            createActorComponentsDataProvider(),
            createActorBacktestingDataProviders(),
            createTradingServersManagerDataProvider(),
            createActorHerodotusTasks(),
        ];
        actors.forEach((actor) => actor.launch());
    });
    initActors();

    return root;
}
