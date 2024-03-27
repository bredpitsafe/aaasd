import { TComponentId } from '../types/domain/component';
import { ServerUpdateModuleFactory } from '../utils/ModuleFactories/ServerModuleFactory';

type TSendBody = {
    id: TComponentId;
};

type TReceiveBody = {
    id: TComponentId;
    type: 'ComponentRemoved';
};

export const ModuleRemoveComponent = ServerUpdateModuleFactory<TSendBody, TReceiveBody>(
    'RemoveComponent',
)();
