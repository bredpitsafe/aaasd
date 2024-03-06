import { lazifyActor } from '../../utils/Actors';
import {
    getPortfolioPositionsEnvBox,
    getPortfolioRisksEnvBox,
    getPortfoliosWithBooksEnvBox,
    getPortfolioTradesEnvBox,
} from './envelops';

export const createLazyActorPortfolioTrackerDataProvider = () =>
    lazifyActor(
        (envelope) => {
            switch (envelope.type) {
                case getPortfoliosWithBooksEnvBox.requestType:
                case getPortfolioPositionsEnvBox.requestType:
                case getPortfolioTradesEnvBox.requestType:
                case getPortfolioRisksEnvBox.requestType:
                    return true;
                default:
                    return false;
            }
        },
        () => import('./index').then((m) => m.createActorPortfolioTrackerDataProvider()),
    );
