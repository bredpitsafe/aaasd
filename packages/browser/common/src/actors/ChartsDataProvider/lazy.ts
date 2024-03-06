import { lazifyActor } from '../../utils/Actors';
import { getChartPointsEnvBox } from './envelops';

export const createLazyActorChartsDataProvider = () =>
    lazifyActor(
        (envelope) => {
            switch (envelope.type) {
                case getChartPointsEnvBox.requestType:
                    return true;
                default:
                    return false;
            }
        },
        () => import('./index').then((m) => m.createActorChartsDataProvider()),
    );
