import { TRpcRoutesMap } from '../rpc/def.ts';
import { THttpRoutesMap } from '../transport/http/def.ts';
import { authRpcRoutes } from './auth/rpcRoutes.ts';
import { metricsHttpRoutes } from './metrics/httpRoutes.ts';
import { rootHttpRoutes } from './root/httpRoutes.ts';
import { rootRpcRoutes } from './root/rpcRoutes.ts';
import { stagesRpcRoutes } from './stages/rpcRoutes.ts';
import { convertRatesRpcRoutes } from './tradingDataProvider/rpcRoutes.ts';

export const rpcRoutes: TRpcRoutesMap = {
    ...rootRpcRoutes,
    ...stagesRpcRoutes,
    ...authRpcRoutes,
    ...convertRatesRpcRoutes,
};

export const httpRoutes: THttpRoutesMap = {
    ...rootHttpRoutes,
    ...metricsHttpRoutes,
};
