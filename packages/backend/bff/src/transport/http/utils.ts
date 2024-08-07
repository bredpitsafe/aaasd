import type { EHttpRouteName, THttpRoute } from './def.ts';

export function createHttpRoutes<T extends EHttpRouteName>(
    routesConfig: Record<T, THttpRoute>,
): Record<T, THttpRoute> {
    return routesConfig;
}
