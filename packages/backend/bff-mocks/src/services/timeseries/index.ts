import type { Server } from '@grpc/grpc-js';

import { timeseriesService, TimeseriesServiceService } from './timeseries.ts';

export const initTimeseriesService = (server: Server): void => {
    server.addService(TimeseriesServiceService, timeseriesService);
};
