import { EApplicationName } from '@frontend/common/src/types/app';
import { createSharedWorkerRoot } from '@frontend/common/src/workers/SharedRoot';
import { setupTabThread } from '@frontend/common/src/workers/utils/setupTabThread';
import { connectWorkerToActor } from 'webactor';

import { createActorCharterJsonViewerTab } from './actor';

const workerRoot = createSharedWorkerRoot();
const actorTab = createActorCharterJsonViewerTab();

connectWorkerToActor(workerRoot, actorTab);

actorTab.launch();

setupTabThread(EApplicationName.CharterJsonViewer, workerRoot.port);
