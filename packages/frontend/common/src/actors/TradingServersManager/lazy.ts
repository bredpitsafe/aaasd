import { lazifyActor } from '../../utils/Actors';
import {
    getComponentStateEnvBox,
    getComponentStateRevisionEnvBox,
    getComponentStateRevisionsEnvBox,
    getGateKindsEnvBox,
    requestOrdersItemsEnvBox,
    subscribeToOrdersUpdatesEnvBox,
} from './envelops';

export const createLazyTradingServersManagerDataProvider = () =>
    lazifyActor(
        (envelope) => {
            switch (envelope.type) {
                case getComponentStateRevisionEnvBox.requestType:
                case getComponentStateRevisionsEnvBox.requestType:
                case getComponentStateEnvBox.requestType:
                case getGateKindsEnvBox.requestType:
                case requestOrdersItemsEnvBox.requestType:
                case subscribeToOrdersUpdatesEnvBox.requestType:
                    return true;
                default:
                    return false;
            }
        },
        () => import('./index').then((m) => m.createTradingServersManagerDataProvider()),
    );
