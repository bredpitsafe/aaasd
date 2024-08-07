import type { ValueOf } from '@common/types';
import type { NavigationOptions, Options, Route, Router } from 'router5';
import { createRouter } from 'router5';
import type { SubscribeState } from 'router5/dist/types/router';
import browserPlugin from 'router5-plugin-browser';
import { filter } from 'rxjs/operators';

import type { TContextRef } from '../../di';
import type { IModuleRouter, TRouterSubscribeState } from '../../types/router';
import { getAppPath } from '../../utils/getPathToRoot.ts';
import { getLocation } from '../../utils/location';
import { openUrlInNewTab } from '../../utils/navigation';
import { createObservableBox } from '../../utils/rx';
import { ModuleApplicationName } from '../applicationName';

export function getRouterModule<RouteMap extends Record<string, Record<string, unknown>>>(
    ctx: TContextRef,
    routes: Route<RouteMap>[],
    options: Partial<Options>,
): IModuleRouter<RouteMap> {
    const { appName } = ModuleApplicationName(ctx);

    const router = createRouter(routes, options);
    const boxRouter = createObservableBox<Router<RouteMap>>(router);
    const boxState = createObservableBox<undefined | TRouterSubscribeState<RouteMap>>(undefined);

    router.usePlugin(
        browserPlugin({
            useHash: false,
            base: getAppPath(appName),
        }),
    );

    router.subscribe((value: SubscribeState) => {
        boxState.set(value as TRouterSubscribeState<RouteMap>);
    });

    const navigate = <K extends keyof RouteMap>(
        routeName: K,
        routeParams: RouteMap[K],
        navOptions?: NavigationOptions,
    ): Promise<void> => {
        const currentRouter = boxRouter.get();
        return new Promise((resolve, reject) => {
            if (currentRouter === undefined) {
                reject(new Error('no router available'));
                return;
            }

            if (routeParams) {
                if (navOptions) {
                    return currentRouter.navigate(
                        routeName as string,
                        routeParams,
                        navOptions,
                        resolve,
                    );
                }
                return currentRouter.navigate(routeName as string, routeParams, resolve);
            }

            return currentRouter.navigate(routeName as string, resolve);
        });
    };

    const navigateNewTab = <K extends keyof RouteMap>(
        route: K,
        params: RouteMap[K],
    ): Window | null => {
        const url = buildUrl(route, params);

        if (!url) {
            return null;
        }

        return openUrlInNewTab(url);
    };

    const buildUrl = <K extends keyof RouteMap>(
        routeName: K,
        routeParams?: RouteMap[K],
    ): string => {
        const currentRouter = boxRouter.get();
        if (currentRouter === undefined) {
            return '';
        }

        const url = currentRouter.buildUrl(routeName as string, routeParams);
        const origin = getLocation('origin');

        return url.startsWith(origin) ? url : origin + url;
    };

    const buildPath = <K extends keyof RouteMap>(
        routeName: K,
        routeParams: RouteMap[K],
    ): string => {
        const currentRouter = boxRouter.get();
        if (currentRouter === undefined) {
            return '';
        }
        if (routeParams !== undefined) {
            return currentRouter.buildPath(routeName as string, routeParams);
        }

        return currentRouter.buildPath(routeName as string);
    };

    const setParams = async (
        routeParams: Partial<ValueOf<RouteMap>>,
        navOptions?: NavigationOptions,
    ): Promise<void> => {
        const state = boxState.get();
        return state === undefined
            ? undefined
            : navigate(
                  state.route.name,
                  {
                      ...state.route.params,
                      ...routeParams,
                  },
                  navOptions,
              );
    };

    return {
        router,
        router$: boxRouter.obs,
        state$: boxState.obs.pipe(
            filter((value): value is TRouterSubscribeState<RouteMap> => value !== undefined),
        ),
        // TODO: We need to migrate to state$
        getState: () => boxState.get()!,
        navigate,
        navigateNewTab,
        buildUrl,
        buildPath,
        setParams,
    };
}
