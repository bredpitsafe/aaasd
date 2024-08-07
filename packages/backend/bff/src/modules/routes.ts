import type { TRpcRoutesMap } from '../rpc/def.ts';
import type { THttpRoutesMap } from '../transport/http/def.ts';
import { authRpcRoutes } from './auth/rpcRoutes.ts';
import { authorizationRpcRoutes } from './authorization/rpcRoutes.ts';
import { cspHttpRoutes } from './csp/httpRoutes.ts';
import { dashboardStorageRpcRoutes } from './dashboardStorage/rpcRoutes.ts';
import { frontendAnalyticsHttpRoutes } from './frontendAnalytics/httpRoutes.ts';
import { instrumentsRpcRoutes } from './instruments/rpcRoutes.ts';
import { metricsHttpRoutes } from './metrics/httpRoutes.ts';
import { rootHttpRoutes } from './root/httpRoutes.ts';
import { rootRpcRoutes } from './root/rpcRoutes.ts';
import { stagesRpcRoutes } from './stages/rpcRoutes.ts';
import { timeseriesRpcRoutes } from './timeseries/rpcRoutes.ts';
import { convertRatesRpcRoutes } from './tradingDataProvider/rpcRoutes.ts';
import { userSettingsRpcRoutes } from './userSettings/rpcRoutes.ts';

export const rpcRoutes: TRpcRoutesMap = {
    ...rootRpcRoutes,
    ...stagesRpcRoutes,
    ...authRpcRoutes,
    ...convertRatesRpcRoutes,
    ...instrumentsRpcRoutes,
    ...authorizationRpcRoutes,
    ...userSettingsRpcRoutes,
    ...dashboardStorageRpcRoutes,
    ...timeseriesRpcRoutes,
};

export const httpRoutes: THttpRoutesMap = {
    ...rootHttpRoutes,
    ...metricsHttpRoutes,
    ...cspHttpRoutes,
    ...frontendAnalyticsHttpRoutes,
};
