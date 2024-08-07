import type { Assign, ValueOf } from '@common/types';
import type { TBase64 } from '@common/utils/src/base64.ts';
import type {
    TEncodedTypicalRouteParams,
    TTypicalRouterData,
    TTypicalStageRouteParams,
} from '@frontend/common/src/modules/router/defs';
import { ETypicalRoute, ETypicalSearchParams } from '@frontend/common/src/modules/router/defs';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { IModuleRouter } from '@frontend/common/src/types/router';

import type { TInternalTransferFormProps } from '../../components/Forms/InternalTransfers/defs';
import type { TManualTransferFormData } from '../../components/Forms/ManualTransfer/defs';

export const EBalanceMonitorRoute = <const>{
    ...ETypicalRoute,
    InternalTransfers: `${ETypicalRoute.Stage}.InternalTransfers`,
    BalanceMonitor: `${ETypicalRoute.Stage}.BalanceMonitor`,
    TransferBlockingRules: `${ETypicalRoute.Stage}.TransferBlockingRules`,
    AmountLimitsRules: `${ETypicalRoute.Stage}.AmountLimitsRules`,
    AutoTransferRules: `${ETypicalRoute.Stage}.AutoTransferRules`,
};

export const EBalanceMonitorSearchParams = <const>{
    ...ETypicalSearchParams,
    Coin: 'coin',
    ManualTransfer: 'manualTransfer',
};

export const EInternalTransfersSearchParams = <const>{
    ...ETypicalSearchParams,
    InternalTransfer: 'internalTransfer',
};

type TBalanceMonitorRouteData = Assign<
    TTypicalStageRouteParams,
    {
        [EBalanceMonitorSearchParams.Coin]?: TCoinId;
        [EBalanceMonitorSearchParams.ManualTransfer]?: TManualTransferFormData;
    }
>;

type TInternalTransfersRouteData = Assign<
    TTypicalStageRouteParams,
    { [EInternalTransfersSearchParams.InternalTransfer]?: TInternalTransferFormProps }
>;

type TBalanceMonitorRouterData = TTypicalRouterData & {
    [EBalanceMonitorRoute.BalanceMonitor]: TBalanceMonitorRouteData;
    [EBalanceMonitorRoute.InternalTransfers]: TInternalTransfersRouteData;
    [EBalanceMonitorRoute.TransferBlockingRules]: TTypicalStageRouteParams;
    [EBalanceMonitorRoute.AmountLimitsRules]: TTypicalStageRouteParams;
    [EBalanceMonitorRoute.AutoTransferRules]: TTypicalStageRouteParams;
};

export type TAllBalanceMonitorRouteParams = ValueOf<TBalanceMonitorRouterData>;

export type TEncodedBalanceMonitorRouteParams = TEncodedTypicalRouteParams & {
    [EBalanceMonitorSearchParams.Coin]?: string;
    [EBalanceMonitorSearchParams.ManualTransfer]?: TBase64<TManualTransferFormData>;
};

export type TEncodedInternalTransfersRouteParams = TEncodedTypicalRouteParams & {
    [EInternalTransfersSearchParams.InternalTransfer]?: TBase64<TInternalTransferFormProps>;
};

export type IModuleBalanceMonitorRouter = IModuleRouter<TBalanceMonitorRouterData>;
