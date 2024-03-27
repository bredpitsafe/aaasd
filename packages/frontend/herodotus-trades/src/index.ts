import '@frontend/common/src/utils/Rx/internalProviders';

import { EApplicationName } from '@frontend/common/src/types/app';
import { createSharedWorkerRoot } from '@frontend/common/src/workers/SharedRoot';
import { setupTabThread } from '@frontend/common/src/workers/utils/setupTabThread';
import { connectWorkerToActor } from 'webactor';

import { createActorHerodotusTradesTab } from './actor';

const workerRoot = createSharedWorkerRoot();
const actorTab = createActorHerodotusTradesTab();

connectWorkerToActor(workerRoot, actorTab);

actorTab.launch();

setupTabThread(EApplicationName.HerodotusTrades, workerRoot.port);
