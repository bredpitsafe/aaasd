import type { TContextRef } from '../../di';
import { createActor } from '../../utils/Actors';
import { ModuleRegisterActorRemoteProcedure } from '../../utils/RPC/registerRemoteProcedure';
import { EActorName } from '../Root/defs';
import { ModuleGetChartPoints } from './actions/ModuleGetChartPoints';
import { getChartPointsProcedureDescriptor } from './descriptors';

export function createActorChartsDataProvider() {
    return createActor(EActorName.ChartsDataProvider, async (context) => {
        const ctx = context as unknown as TContextRef;
        const registerActorRemoteProcedure = ModuleRegisterActorRemoteProcedure(ctx);
        const getChartPoints = ModuleGetChartPoints(ctx);

        registerActorRemoteProcedure(getChartPointsProcedureDescriptor, (params, options) => {
            return getChartPoints(params, options);
        });
    });
}
