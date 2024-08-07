import '@frontend/common/src/utils/Rx/internalProviders';

import { startupApplication } from '@frontend/common/src/effects/startupApplication.ts';

import { createActorHerodotusTradesTab } from './actor';

startupApplication(createActorHerodotusTradesTab());
