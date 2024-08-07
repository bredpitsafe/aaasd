import { TimeZoneList } from '@common/types';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import { ETypicalSearchParams, TYPICAL_GET_PARAMS } from '@frontend/common/src/modules/router/defs';
import { buildRouteQuery } from '@frontend/common/src/modules/router/utils';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import type { IModuleRouter } from '@frontend/common/src/types/router';
import type { THerodotusTaskId } from '@frontend/herodotus/src/types/domain';
import type { Route } from 'router5';

import type { THerodotusTradesRouterData, TTradesRouteParams } from '../../types/router';
import { ETradesRouteParams, ETradesRoutes } from '../../types/router';

const tradesRoutes = [
    {
        name: ETradesRoutes.Trades,
        path: `/${buildRouteQuery(
            TYPICAL_GET_PARAMS,
            ETypicalSearchParams.Socket,
            ETradesRouteParams,
        )}`,
    },
] as Route[];

export function getTradesRouteParams(params: TTradesRouteParams): TTradesRouteParams {
    return {
        socket: params.socket as TSocketName,
        taskId: Number(params.taskId) as THerodotusTaskId,
        robotId: Number(params.robotId) as TRobotId,
        name: params.name || 'Trades',
        timeZone: params.timeZone || TimeZoneList.UTC,
    };
}

export const ModuleHerodotusTradesRouter = ModuleFactory((ctx) => {
    const module = ModuleRouter(ctx);

    module.router.add(tradesRoutes);
    module.router.setOption('allowNotFound', true);

    return module as IModuleRouter<THerodotusTradesRouterData>;
});
