import { lazifyActor } from '../../utils/Actors';
import {
    getChartPointCommentProcedureDescriptor,
    getChartPointsProcedureDescriptor,
} from './descriptors';

export const createLazyActorChartsDataProvider = () =>
    lazifyActor(
        (envelope) => {
            switch (envelope.type) {
                case getChartPointsProcedureDescriptor.name:
                case getChartPointCommentProcedureDescriptor.name:
                    return true;
                default:
                    return false;
            }
        },
        () => import('./index').then((m) => m.createActorChartsDataProvider()),
    );
