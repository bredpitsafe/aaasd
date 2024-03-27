import '@frontend/common/src/utils/Rx/internalProviders';

import { EApplicationName } from '@frontend/common/src/types/app';
import { createSharedWorkerRoot } from '@frontend/common/src/workers/SharedRoot';
import { setupTabThread } from '@frontend/common/src/workers/utils/setupTabThread';
import { connectActorToActor, connectWorkerToActor } from 'webactor';

import { createActorDashboardsTab } from './actor';
import { createActorFullDashboards } from './actors/FullDashboards';
import { FullDashboardsDescriptorNames } from './actors/FullDashboards/descriptors';

const workerRoot = createSharedWorkerRoot();
const actorTab = createActorDashboardsTab();
const fullDashboardActor = createActorFullDashboards();

connectActorToActor(fullDashboardActor, actorTab);

connectWorkerToActor(workerRoot, {
    transmitter: actorTab,
    map(envelope) {
        return FullDashboardsDescriptorNames.has(envelope.type) ? undefined : envelope;
    },
});
connectWorkerToActor(workerRoot, fullDashboardActor);

fullDashboardActor.launch();
actorTab.launch();

setupTabThread(EApplicationName.Dashboard, workerRoot.port);
