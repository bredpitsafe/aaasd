import type {
    TAllTypicalRouteParams,
    TEncodedTypicalRouteParams,
    TTypicalRouterData,
} from '@frontend/common/src/modules/router/defs';
import { ETypicalRoute } from '@frontend/common/src/modules/router/defs';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';

export const EHerodotusTerminalRoutes = <const>{
    ...ETypicalRoute,
    Robot: `${ETypicalRoute.Stage}.robot`,
};

export type THerodotusTerminalRoute =
    (typeof EHerodotusTerminalRoutes)[keyof typeof EHerodotusTerminalRoutes];

export enum EHerodotusTerminalRouteParams {
    Robot = 'robot',
}

export type THerodotusTerminalRouteParams = TEncodedTypicalRouteParams & {
    [EHerodotusTerminalRouteParams.Robot]: string | undefined;
};

export type THerodotusTerminalParams = TAllTypicalRouteParams & {
    [EHerodotusTerminalRouteParams.Robot]: TRobotId | undefined;
};

export type THerodotusTerminalRouterData = TTypicalRouterData & {
    [EHerodotusTerminalRoutes.Robot]: THerodotusTerminalParams;
};
