import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { createTabJson } from '@frontend/common/src/modules/layouts/utils';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { DockLocation } from 'flexlayout-react';

import type { TInternalTransferFormProps } from '../../components/Forms/InternalTransfers/defs';
import { EInternalTransfersLayoutComponents } from '../../layouts/defs';
import { EBalanceMonitorRoute } from '../router/def';
import { ModuleBalanceMonitorRouter } from '../router/module';

export const ModuleFillInternalTransferAction = ModuleFactory((ctx: TContextRef) => {
    const { navigate, getState } = ModuleBalanceMonitorRouter(ctx);
    const { getCurrentSocket } = ModuleSocketPage(ctx);
    const { upsertTab } = ModuleLayouts(ctx);

    return {
        fillInternalTransfer(internalTransfer?: TInternalTransferFormProps) {
            const socket = getCurrentSocket()?.name;

            if (socket === undefined) {
                throw new Error('Socket not defined');
            }

            // TODO: Rewrite to use route parameters after FRT-1722
            upsertTab(EInternalTransfersLayoutComponents.InternalTransfers, {
                json: createTabJson(EInternalTransfersLayoutComponents.InternalTransfers),
                location: DockLocation.TOP,
                select: true,
            });

            return navigate(EBalanceMonitorRoute.InternalTransfers, {
                ...getState().route.params,
                socket,
                internalTransfer,
            });
        },
    };
});
