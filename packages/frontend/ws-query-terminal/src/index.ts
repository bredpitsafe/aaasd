import { startupApplication } from '@frontend/common/src/effects/startupApplication.ts';

import { createAppActor } from './actor';

startupApplication(createAppActor());
