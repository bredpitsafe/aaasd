import type {
    TEncodedTypicalRouteParams,
    TTypicalRouterData,
} from '@frontend/common/src/modules/router/defs';
import {
    ETypicalRoute,
    ETypicalSearchParams,
    TTypicalStageRouteParams,
} from '@frontend/common/src/modules/router/defs';
import type { Assign, ValueOf } from '@frontend/common/src/types';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { IModuleRouter } from '@frontend/common/src/types/router';
import type { TBase64 } from '@frontend/common/src/utils/base64';

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

type TBalanceMonitorRouteData = Assign<
    TTypicalStageRouteParams,
    {
        [EBalanceMonitorSearchParams.Coin]?: TCoinId;
        [EBalanceMonitorSearchParams.ManualTransfer]?: TManualTransferFormData;
    }
>;

type TBalanceMonitorRouterData = TTypicalRouterData & {
    [EBalanceMonitorRoute.BalanceMonitor]: TBalanceMonitorRouteData;
    [EBalanceMonitorRoute.InternalTransfers]: TTypicalStageRouteParams;
    [EBalanceMonitorRoute.TransferBlockingRules]: TTypicalStageRouteParams;
    [EBalanceMonitorRoute.AmountLimitsRules]: TTypicalStageRouteParams;
    [EBalanceMonitorRoute.AutoTransferRules]: TTypicalStageRouteParams;
};

export type TAllBalanceMonitorRouteParams = ValueOf<TBalanceMonitorRouterData>;

export type TEncodedBalanceMonitorRouteParams = TEncodedTypicalRouteParams & {
    [EBalanceMonitorSearchParams.Coin]?: string;
    [EBalanceMonitorSearchParams.ManualTransfer]?: TBase64<TManualTransferFormData>;
};

export type IModuleBalanceMonitorRouter = IModuleRouter<TBalanceMonitorRouterData>;
