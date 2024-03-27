import { createActorEnvelopeBox } from '../../utils/Actors';
import { createActorObservableBox } from '../../utils/Actors/observable';
import { TSettingsStoreName } from './db';

export type TApplication = {
    storeName: TSettingsStoreName | undefined;
};

export type TSettingsGetter = TApplication & {
    key: string;
};

export type TSettingsSetter = TSettingsGetter & {
    value: unknown;
};

export const setSettingsEnvBox = createActorEnvelopeBox<TSettingsSetter>()('SET_SETTINGS');
export const deleteSettingsEnvBox = createActorEnvelopeBox<TSettingsGetter>()('DELETE_SETTINGS');

export const settingsEnvBox = createActorObservableBox<
    {
        storeName: TSettingsStoreName | undefined;
        key: string;
    },
    undefined
>()('SETTINGS');
