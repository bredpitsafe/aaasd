import type { TCoinBalanceReconciliationSuggest } from '../../../types/domain/balanceMonitor/defs';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TEmptySendBody } from './defs';

type TReceiveBody = TCoinBalanceReconciliationSuggest & {
    type: 'Suggests';
};

export const ModuleSubscribeToSuggestsHandle = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBody
>('SubscribeToSuggests', { skipAuthentication: false })();
