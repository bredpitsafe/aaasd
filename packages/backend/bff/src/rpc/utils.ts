import { isNil } from 'lodash-es';

import type { TRpcResponse, TRpcRouteName } from '../def/rpc.ts';
import type { TRoutesConfig } from './def.ts';

// Needed for correct typing
export function createRpcRoutes<T extends TRpcRouteName>(
    routesConfig: TRoutesConfig<T>,
): TRoutesConfig<T> {
    return routesConfig;
}

export function isErrorResponse(response: TRpcResponse): boolean {
    return !('payload' in response) && !isNil(response?.error);
}
