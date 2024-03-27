import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { createTabJson } from '@frontend/common/src/modules/layouts/utils';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { DockLocation } from 'flexlayout-react';

import type { TManualTransferFormData } from '../../components/Forms/ManualTransfer/defs';
import { EBalanceMonitorLayoutComponents } from '../../layouts/defs';
import { EBalanceMonitorRoute } from '../router/def';
import { ModuleBalanceMonitorRouter } from '../router/module';

export const ModuleFillManualTransferAction = ModuleFactory((ctx: TContextRef) => {
    const { navigate, getState } = ModuleBalanceMonitorRouter(ctx);
    const { getCurrentSocket } = ModuleSocketPage(ctx);
    const { upsertTab } = ModuleLayouts(ctx);

    return {
        fillManualTransfer(manualTransfer?: TManualTransferFormData) {
            const socket = getCurrentSocket()?.name;

            if (socket === undefined) {
                throw new Error('Socket not defined');
            }

            // TODO: Rewrite to use route parameters after FRT-1722
            upsertTab(EBalanceMonitorLayoutComponents.ManualTransfer, {
                json: createTabJson(EBalanceMonitorLayoutComponents.ManualTransfer),
                location: DockLocation.RIGHT,
                select: true,
            });

            return navigate(EBalanceMonitorRoute.BalanceMonitor, {
                ...getState().route.params,
                socket,
                manualTransfer,
            });
        },
    };
});
