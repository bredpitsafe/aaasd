import type { Server } from '@grpc/grpc-js';

import { initAuthorizationService } from './authorization/index.ts';
import { initInstrumentsService } from './instruments/index.ts';
import { initTimeseriesService } from './timeseries/index.ts';

export const initAllServices = (server: Server): void => {
    initAuthorizationService(server);
    initInstrumentsService(server);
    initTimeseriesService(server);
};
