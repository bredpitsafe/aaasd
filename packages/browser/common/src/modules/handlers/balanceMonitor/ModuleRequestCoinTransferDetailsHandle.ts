import type { TCoinId, TCoinTransferDetailsItem } from '../../../types/domain/balanceMonitor/defs';
import { ServerResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';

type TSendBody = {
    coin: TCoinId | undefined;
};

type TReceiveBody = {
    type: 'TransferDetails';
    details: Omit<TCoinTransferDetailsItem, 'rowId'>[];
};

export const ModuleRequestCoinTransferDetailsHandle = ServerResourceModuleFactory<
    TSendBody,
    TReceiveBody
>('RequestCoinTransferDetails', { skipAuthentication: false })();
