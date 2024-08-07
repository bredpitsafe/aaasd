import { useModule } from '../di/react';
import { ModuleTypicalRouter } from '../modules/router';
import { ETypicalRoute, ETypicalSearchParams } from '../modules/router/defs';
import { extractRouterParam } from '../modules/router/utils';
import type { TSocketName } from '../types/domain/sockets';
import { useFunction } from '../utils/React/useFunction';

export function useStageSwitch(keepRestParams = false) {
    const { navigate, getState } = useModule(ModuleTypicalRouter);

    return useFunction((socket: TSocketName) => {
        navigate(ETypicalRoute.Stage, {
            ...(keepRestParams ? getState().route.params : {}),
            [ETypicalSearchParams.Socket]: socket,
            [ETypicalSearchParams.Tab]: extractRouterParam(
                getState().route,
                ETypicalSearchParams.Tab,
            ),
        });
    });
}
