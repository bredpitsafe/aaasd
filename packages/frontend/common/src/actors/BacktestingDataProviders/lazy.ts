import { lazifyActor } from '../../utils/Actors';
import {
    getBacktestingTaskConfigsProcedureDescriptor,
    subscribeToBacktestingRunProcedureDescriptor,
    subscribeToBacktestingTaskProcedureDescriptor,
} from './procedureDescriptors';

export const createLazyActorBacktestingDataProviders = () =>
    lazifyActor(
        (envelope) => {
            switch (envelope.type) {
                case getBacktestingTaskConfigsProcedureDescriptor.name:
                case subscribeToBacktestingTaskProcedureDescriptor.name:
                case subscribeToBacktestingRunProcedureDescriptor.name:
                    return true;
                default:
                    return false;
            }
        },
        () => import('./index').then((m) => m.createActorBacktestingDataProviders()),
    );
