import '@frontend/common/src/utils/Rx/internalProviders';

import { EApplicationName } from '@frontend/common/src/types/app';
import { createSharedWorkerRoot } from '@frontend/common/src/workers/SharedRoot';
import { setupTabThread } from '@frontend/common/src/workers/utils/setupTabThread';
import { connectWorkerToActor } from 'webactor';

import { createActorPortfolioTrackerTab } from './actor';

const workerRoot = createSharedWorkerRoot();
const actorTab = createActorPortfolioTrackerTab();

connectWorkerToActor(workerRoot, actorTab);

actorTab.launch();

setupTabThread(EApplicationName.PortfolioTracker, workerRoot.port);
