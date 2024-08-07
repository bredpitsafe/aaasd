import { ERpcMethod } from '../../rpc/def.ts';
import { createRpcRoutes } from '../../rpc/utils.ts';
import { EStagesRouteName } from './def.ts';
import { subscribeToStagesHandler } from './handlers/SubscribeToStages.ts';

export const stagesRpcRoutes = createRpcRoutes<EStagesRouteName>({
    [EStagesRouteName.SubscribeToStages]: {
        method: ERpcMethod.SUBSCRIBE,
        options: {
            skipAuth: true,
        },
        handler: subscribeToStagesHandler,
    },
});
