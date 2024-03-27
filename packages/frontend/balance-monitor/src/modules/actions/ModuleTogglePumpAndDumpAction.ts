import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { createTabJson } from '@frontend/common/src/modules/layouts/utils';
import { DockLocation } from 'flexlayout-react';

import { EBalanceMonitorCommonLayoutComponents } from '../../layouts/common';

export const ModuleTogglePumpAndDumpAction = ModuleFactory((ctx: TContextRef) => {
    const { toggleTab } = ModuleLayouts(ctx);

    return {
        togglePumpAndDump() {
            toggleTab(EBalanceMonitorCommonLayoutComponents.PumpAndDump, {
                json: createTabJson(EBalanceMonitorCommonLayoutComponents.PumpAndDump),
                location: DockLocation.RIGHT,
                select: true,
            });
        },
    };
});
