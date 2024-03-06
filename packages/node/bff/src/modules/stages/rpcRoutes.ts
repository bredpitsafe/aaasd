import { of } from 'rxjs';

import { ERpcMethod } from '../../rpc/def.ts';
import { createRpcRoutes } from '../../rpc/utils.ts';
import { getStages } from '../root/service.ts';
import { EStagesRouteName } from './def.ts';

export const stagesRpcRoutes = createRpcRoutes<EStagesRouteName>({
    [EStagesRouteName.FetchStages]: {
        method: ERpcMethod.CALL,
        options: {
            skipAuth: true,
        },
        handler() {
            return of({
                type: 'Stages',
                stages: getStages(),
            });
        },
    },
});
