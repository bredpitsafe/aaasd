import type { ValueOf } from '@common/types';
import type { NavigationOptions, Router } from 'router5';
import type { StateMeta } from 'router5/dist/types/base';
import type { Observable } from 'rxjs';

export type TBaseRouteMap = Record<string, Record<string, unknown>>;

export type TRouteState<RouteMap extends TBaseRouteMap> = {
    [K in keyof RouteMap]: {
        name: K;
        params: RouteMap[K];
        path: string;
        meta?: StateMeta;
    };
}[keyof RouteMap];

export interface TRouterSubscribeState<RouteMap extends TBaseRouteMap> {
    route: TRouteState<RouteMap>;
    previousRoute: TRouteState<RouteMap>;
}

export interface IModuleRouter<RouteMap extends TBaseRouteMap> {
    router: Router<RouteMap>;
    router$: Observable<Router<RouteMap>>;
    state$: Observable<TRouterSubscribeState<RouteMap>>;
    getState: () => TRouterSubscribeState<RouteMap>;
    navigate: <K extends keyof RouteMap>(
        route: K,
        params: RouteMap[K],
        navOptions?: NavigationOptions,
    ) => Promise<void>;
    navigateNewTab: <K extends keyof RouteMap>(route: K, params: RouteMap[K]) => Window | null;
    buildUrl: <K extends keyof RouteMap>(route: K, params: RouteMap[K]) => string;
    buildPath: <K extends keyof RouteMap>(route: K, params: RouteMap[K]) => string;
    setParams: (
        params: Partial<ValueOf<RouteMap>>,
        navOptions?: NavigationOptions,
    ) => Promise<void>;
}
