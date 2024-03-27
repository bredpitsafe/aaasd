import { lazifyActor } from '../../utils/Actors';
import { getAssetsEnvBox, getInstrumentsEnvBox } from './envelopes';

export const createLazyActorDictionaries = () =>
    lazifyActor(
        (envelope) => {
            switch (envelope.type) {
                case getAssetsEnvBox.requestType:
                case getInstrumentsEnvBox.requestType:
                    return true;
                default:
                    return false;
            }
        },
        () => import('./index').then((m) => m.createActorDictionaries()),
    );
