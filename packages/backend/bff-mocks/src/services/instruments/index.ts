import type { Server } from '@grpc/grpc-js';

import { AssetServiceService, assetsService } from './assets.ts';
import { indexesService, IndexServiceService } from './indexes.ts';
import { InstrumentServiceService, instrumentsService } from './instruments.ts';

export const initInstrumentsService = (server: Server): void => {
    server.addService(InstrumentServiceService, instrumentsService);
    server.addService(AssetServiceService, assetsService);
    server.addService(IndexServiceService, indexesService);
};
