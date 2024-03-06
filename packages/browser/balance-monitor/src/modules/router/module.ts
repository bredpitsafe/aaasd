import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleTypicalRouter } from '@frontend/common/src/modules/router';
import { TYPICAL_GET_PARAMS } from '@frontend/common/src/modules/router/defs';
import {
    decodeTypicalParams,
    encodeTypicalParams,
} from '@frontend/common/src/modules/router/encoders';
import type { Route } from 'router5';

import type { IModuleBalanceMonitorRouter } from './def';
import { EBalanceMonitorRoute, EBalanceMonitorSearchParams } from './def';
import { decodeParams, encodeParams } from './encoders';

const routes = [
    {
        name: EBalanceMonitorRoute.BalanceMonitor,
        path: `/balance-monitor${TYPICAL_GET_PARAMS}&:${EBalanceMonitorSearchParams.Coin}&:${EBalanceMonitorSearchParams.ManualTransfer}`,
        encodeParams,
        decodeParams,
    },
    {
        name: EBalanceMonitorRoute.InternalTransfers,
        path: `/internal-transfers${TYPICAL_GET_PARAMS}`,
        encodeParams: encodeTypicalParams,
        decodeParams: decodeTypicalParams,
    },
    {
        name: EBalanceMonitorRoute.TransferBlockingRules,
        path: `/transfer-blocking-rules${TYPICAL_GET_PARAMS}`,
        encodeParams: encodeTypicalParams,
        decodeParams: decodeTypicalParams,
    },
    {
        name: EBalanceMonitorRoute.AmountLimitsRules,
        path: `/amount-limits-rules${TYPICAL_GET_PARAMS}`,
        encodeParams: encodeTypicalParams,
        decodeParams: decodeTypicalParams,
    },
    {
        name: EBalanceMonitorRoute.AutoTransferRules,
        path: `/auto-transfer-rules${TYPICAL_GET_PARAMS}`,
        encodeParams: encodeTypicalParams,
        decodeParams: decodeTypicalParams,
    },
] as Route[];

export const ModuleBalanceMonitorRouter = ModuleFactory((ctx): IModuleBalanceMonitorRouter => {
    const module = ModuleTypicalRouter(ctx);

    module.router.add(routes);

    return module as unknown as IModuleBalanceMonitorRouter;
});
