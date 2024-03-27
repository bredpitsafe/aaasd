import { lazifyActor } from '../../utils/Actors';
import {
    fetchIndicatorsInfinitySnapshotProcedureDescriptor,
    subscribeToIndicatorsFiniteSnapshotProcedureDescriptor,
    subscribeToIndicatorsInfinitySnapshotProcedureDescriptor,
} from './descriptors.ts';

export const createLazyIndicatorsDataProvider = () =>
    lazifyActor(
        (envelope) => {
            switch (envelope.type) {
                case fetchIndicatorsInfinitySnapshotProcedureDescriptor.name:
                case subscribeToIndicatorsInfinitySnapshotProcedureDescriptor.name:
                case subscribeToIndicatorsFiniteSnapshotProcedureDescriptor.name:
                    return true;
                default:
                    return false;
            }
        },
        () => import('./index').then((m) => m.createActorChartsDataProvider()),
    );
