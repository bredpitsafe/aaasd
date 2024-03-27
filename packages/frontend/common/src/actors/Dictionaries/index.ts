import { TContextRef } from '../../di';
import { createActor } from '../../utils/Actors';
import { EActorName } from '../Root/defs';
import { getAssetsDictionary$ } from './actions/assets';
import { getInstrumentsDictionary$ } from './actions/instruments';
import { getAssetsEnvBox, getInstrumentsEnvBox } from './envelopes';

export function createActorDictionaries() {
    return createActor(EActorName.Dictionaries, (context) => {
        const ctx = context as unknown as TContextRef;

        getAssetsEnvBox.response(context, (props) => getAssetsDictionary$(ctx, props));

        getInstrumentsEnvBox.response(context, (props) => getInstrumentsDictionary$(ctx, props));
    });
}
