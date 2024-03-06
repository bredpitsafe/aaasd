import '@frontend/common/src/utils/Rx/internalProviders';

import { EApplicationName } from '@frontend/common/src/types/app';
import { createSharedWorkerRoot } from '@frontend/common/src/workers/SharedRoot';
import { setupTabThread } from '@frontend/common/src/workers/utils/setupTabThread';
import { connectWorkerToActor } from 'webactor';

import { createActorBacktestingTab } from './actor';

const sharedWorkerRoot = createSharedWorkerRoot();
const dashboardsTab = createActorBacktestingTab();

connectWorkerToActor(sharedWorkerRoot, dashboardsTab);

dashboardsTab.launch();

setupTabThread(EApplicationName.BacktestingManager, sharedWorkerRoot.port);
