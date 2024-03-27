import type { THerodotusTaskId, THerodotusTrade } from '../../../herodotus/src/types/domain';
import type { TRobotId } from '../types/domain/robots';
import { ServerResourceModuleFactory } from '../utils/ModuleFactories/ServerModuleFactory';

type TSendBody = {
    taskId: THerodotusTaskId;
    robotId: TRobotId;
};

type TReceivedBody = {
    trades: THerodotusTrade[];
};

export const ModuleGetListHerodotusTradesResource = ServerResourceModuleFactory<
    TSendBody,
    TReceivedBody
>('ListHerodotusTrades')();
