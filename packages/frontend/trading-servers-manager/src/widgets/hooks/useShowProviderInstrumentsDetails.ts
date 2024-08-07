import type {
    TInstrument,
    TInstrumentDynamicData,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { DockLocation } from 'flexlayout-react';
import { isEmpty } from 'lodash-es';

import { EDefaultLayoutComponents } from '../../layouts/default.tsx';
import { ModuleTradingServersManagerRouter } from '../../modules/router/module.ts';

export function useShowProviderInstrumentsDetails(): (
    instruments: (TInstrument | TInstrumentDynamicData)[],
) => Promise<boolean> {
    const { setParams } = useModule(ModuleTradingServersManagerRouter);
    const { upsertTab } = useModule(ModuleLayouts);

    return useFunction(async (instruments: (TInstrument | TInstrumentDynamicData)[]) => {
        if (isEmpty(instruments)) {
            return false;
        }

        const instrumentIds = instruments.map(({ id }) => id);

        await setParams({ overrideInstruments: instrumentIds });

        upsertTab(EDefaultLayoutComponents.ProviderInstrumentDetails, {
            location: DockLocation.RIGHT,
            select: true,
        });

        return true;
    });
}
