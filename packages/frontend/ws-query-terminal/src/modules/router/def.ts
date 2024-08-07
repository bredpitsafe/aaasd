import type {
    TAllTypicalRouteParams,
    TEncodedTypicalRouteParams,
    TTypicalRouterData,
} from '@frontend/common/src/modules/router/defs';
import { ETypicalRoute } from '@frontend/common/src/modules/router/defs';

export const EWSQueryTerminalRoutes = <const>{
    ...ETypicalRoute,
    Terminal: `${ETypicalRoute.Stage}.terminal`,
};

export type TWSQueryTerminalRoute =
    (typeof EWSQueryTerminalRoutes)[keyof typeof EWSQueryTerminalRoutes];

export enum EWSQueryTerminalRouteParams {
    Query = 'query',
}

export type TWSQueryTerminalRouteParams = TEncodedTypicalRouteParams & {
    [EWSQueryTerminalRouteParams.Query]: string | undefined;
};

export type TWSQueryTerminalParams = TAllTypicalRouteParams & {
    [EWSQueryTerminalRouteParams.Query]: string | undefined;
};

export type TWSQueryTerminalRouterData = TTypicalRouterData & {
    [EWSQueryTerminalRoutes.Terminal]: TWSQueryTerminalParams;
};
