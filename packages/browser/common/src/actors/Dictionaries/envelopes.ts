import { createActorRequestBox } from '../../utils/Actors/request';
import { TAssetsDictionaryProps, TGetAssetsDictionaryReturnType } from './actions/assets';
import {
    TGetInstrumentsDictionaryReturnType,
    TInstrumentsDictionaryProps,
} from './actions/instruments';

export const getAssetsEnvBox = createActorRequestBox<
    TAssetsDictionaryProps,
    TGetAssetsDictionaryReturnType
>()('getAssets');

export const getInstrumentsEnvBox = createActorRequestBox<
    TInstrumentsDictionaryProps,
    TGetInstrumentsDictionaryReturnType
>()('getInstruments');
