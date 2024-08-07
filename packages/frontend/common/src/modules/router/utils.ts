import type { UnionToIntersection, ValueOf } from '@common/types';
import { isArray, isEmpty, isObject } from 'lodash-es';

import type { TRouteState } from '../../types/router';

export function extractRouterParam<
    RouteMap extends Record<string, Record<string, any>>,
    ParamsMap extends UnionToIntersection<ValueOf<RouteMap>>,
    ParamKey extends keyof ParamsMap,
>(route: TRouteState<RouteMap>, param: ParamKey): undefined | ParamsMap[ParamKey] {
    return param in route.params ? (route.params as ParamsMap)[param] : undefined;
}

export function buildRouteQuery(...params: (string | string[] | Record<string, string>)[]): string {
    if (isEmpty(params)) {
        return '';
    }

    const query = params
        .reduce((acc: string[], param) => {
            if (isArray(param)) {
                return acc.concat(param);
            }

            if (isObject(param)) {
                return acc.concat(Object.values(param));
            }

            return acc.concat([param]);
        }, [])
        .join('&:');

    if (query.startsWith('?:')) {
        return query;
    }

    if (query.startsWith('&:')) {
        return query.replace('&:', '?:');
    }

    return `?:${query}`;
}
