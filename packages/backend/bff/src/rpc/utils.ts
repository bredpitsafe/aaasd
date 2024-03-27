import { TRpcRouteName } from '../def/rpc.ts';
import { TRoutesConfig } from './def.ts';

// Needed for correct typing
export function createRpcRoutes<T extends TRpcRouteName>(
    routesConfig: TRoutesConfig<T>,
): TRoutesConfig<T> {
    return routesConfig;
}
