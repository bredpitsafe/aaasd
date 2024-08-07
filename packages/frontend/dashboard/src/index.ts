import '@frontend/common/src/utils/Rx/internalProviders';

import { createLocalWorkerActor } from '@frontend/common/src/actors/LocalWorker';

import { createActorDashboardsTab } from './actor';
import { createActorFullDashboards } from './actors/FullDashboards';

const workerRoot = createLocalWorkerActor();
const actorTab = createActorDashboardsTab();
const fullDashboardActor = createActorFullDashboards();

/*connectActorToActor(fullDashboardActor, actorTab);

connectActorToActor(workerRoot, {
    transmitter: actorTab,
    map(envelope) {
        return FullDashboardsDescriptorNames.has(envelope.type) ? undefined : envelope;
    },
});
connectActorToActor(workerRoot, fullDashboardActor);*/

workerRoot.launch();
fullDashboardActor.launch();
actorTab.launch();
