import { lazifyActor } from '../../utils/Actors';
import {
    requestBacktestingTaskItemsEnvBox,
    requestOwnTradeItemsEnvBox,
    requestProductLogItemsEnvBox,
    subscribeToBacktestingTaskUpdatesEnvBox,
    subscribeToOwnTradeUpdatesEnvBox,
    subscribeToProductLogUpdatesEnvBox,
} from './envelope';

export const createLazyActorInfinityHistory = () =>
    lazifyActor(
        (envelope) => {
            switch (envelope.type) {
                case requestProductLogItemsEnvBox.requestType:
                case subscribeToProductLogUpdatesEnvBox.requestType:
                case requestOwnTradeItemsEnvBox.requestType:
                case subscribeToOwnTradeUpdatesEnvBox.requestType:
                case requestBacktestingTaskItemsEnvBox.requestType:
                case subscribeToBacktestingTaskUpdatesEnvBox.requestType:
                    return true;
                default:
                    return false;
            }
        },
        () => import('./index').then((m) => m.createActorInfinityHistory()),
    );
