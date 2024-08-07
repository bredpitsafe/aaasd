import type {
    TEncodedLayoutRouteParams,
    TEncodedTableRouteParams,
    TLayoutRouteParams,
    TTableRouteParams,
} from '@frontend/common/src/modules/router/defs';

export enum EAuthzRoutes {
    Auth = 'auth',
}

export type TAuthzRouteParams = TLayoutRouteParams & TTableRouteParams;

export type TEncodedAuthzParams = TEncodedLayoutRouteParams & TEncodedTableRouteParams;

export type TAuthzRouterData = {
    [EAuthzRoutes.Auth]: TAuthzRouteParams;
};
